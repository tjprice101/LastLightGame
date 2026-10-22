# Phase 0 Conduit behavior matrix

This is executed numerical behavior evidence, not a count of source references or nonempty ability strings.
The approved ability contract remains [conduit-catalog.txt](conduit-catalog.txt).
The release gate is enabled for coordinated client/authority publication (D-370). This report certifies tested behavior, not hosted deployment or balance quality.

- Roster: **138/138** entries, **726** passing baseline/equipment/upgrade scenarios.
- Ordinary-slot entries: 90, each with an absent baseline and all six +0..+5 upgrade levels.
- Named Masters: 48, each with a concrete equipped and absent numerical behavior scenario.
- Full regression: **5982 tests / 197 files passed**; zero failed or pending.
- Description parity: all 138 defaults against the complete owner-authored catalog; all 90 ordinary entries at +0..+5; Masters reject upgrades.
- Separate interaction tests cover generated Master Shield provenance, manual native packets, stored-packet scaling, duplicate auras, additive stat pools and Defense caps.
- UI and authority suites additionally exercise target-dependent costs, frozen equipment and Throne controls.
- Passing tests do not establish subjective usefulness or mathematically exhaustive balance across every possible squad.

Evidence source SHA-256 (LF-normalized): `460a247aa3064957f44deb0e1846e843c968d7a619548c19b9e0cd89c624a8d4`.
Regenerate only from a complete passing full-suite JSON report:

```powershell
node tools\build_phase_zero_behavior_matrix.mjs "<passing-report.json>"
```

| # | Conduit | Stable ID | Variants | Numerical behavior test | Result |
|---|---|---|---|---|---|
| 1 | Bastion Lock | `bastion-lock` | Absent; +0..+5 | [bastion-lock scales its approved benefit once](../src/content/phase-zero-conduit-stats.test.ts) | 7 passed |
| 2 | Crosspin Governor | `crosspin-governor` | Absent; +0..+5 | [crosspin-governor scales its approved benefit once](../src/content/phase-zero-conduit-stats.test.ts) | 7 passed |
| 3 | Fieldbrace Coupler | `fieldbrace-coupler` | Absent; +0..+5 | [fieldbrace-coupler scales its approved benefit once](../src/content/phase-zero-conduit-stats.test.ts) | 7 passed |
| 4 | Fracture Reservoir | `fracture-reservoir` | Absent; +0..+5 | [fracture-reservoir scales its approved benefit once](../src/content/phase-zero-conduit-stats.test.ts) | 7 passed |
| 5 | Parallax Relay | `parallax-relay` | Absent; +0..+5 | [parallax-relay scales its approved benefit once](../src/content/phase-zero-conduit-stats.test.ts) | 7 passed |
| 6 | Precision Escapement | `precision-escapement` | Absent; +0..+5 | [precision-escapement scales its approved benefit once](../src/content/phase-zero-conduit-stats.test.ts) | 7 passed |
| 7 | Prism Splinter Socket | `prism-splinter-socket` | Absent; +0..+5 | [prism-splinter-socket scales its approved benefit once](../src/content/phase-zero-conduit-stats.test.ts) | 7 passed |
| 8 | Reserve Torque Crank | `reserve-torque-crank` | Absent; +0..+5 | [reserve-torque-crank scales its approved benefit once](../src/content/phase-zero-conduit-stats.test.ts) | 7 passed |
| 9 | Siegebound Drive | `siegebound-drive` | Absent; +0..+5 | [siegebound-drive scales its approved benefit once](../src/content/phase-zero-conduit-stats.test.ts) | 7 passed |
| 10 | Vigil Core | `vigil-core` | Absent; +0..+5 | [vigil-core scales its approved benefit once](../src/content/phase-zero-conduit-stats.test.ts) | 7 passed |
| 11 | Aegis Capacitor | `aegis-capacitor` | Absent; +0..+5 | [aegis-capacitor grants Defense only on another ally skill Shield and expires next Enemy Turn](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 12 | Breach Pendulum | `breach-pendulum` | Absent; +0..+5 | [breach-pendulum scales only Normal critical damage above the strict 75% threshold](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 13 | Coilfeed Ratchet | `coilfeed-ratchet` | Absent; +0..+5 | [coilfeed-ratchet scales its approved benefit once](../src/content/phase-zero-conduit-stats.test.ts) | 7 passed |
| 14 | Duplex Heart | `duplex-heart` | Absent; +0..+5 | [duplex-heart heals the caster once after effective other-ally skill healing](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 15 | Falcon Sight | `falcon-sight` | Absent; +0..+5 | [falcon-sight counts Attack Actions, not targets, and spends one guaranteed critical](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 16 | Glassroot Gimbal | `glassroot-gimbal` | Absent; +0..+5 | [glassroot-gimbal has no Shield bonus and does not affect Normal Attack](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 17 | Hammerbalance Link | `hammerbalance-link` | Absent; +0..+5 | [hammerbalance-link scales its approved benefit once](../src/content/phase-zero-conduit-stats.test.ts) | 7 passed |
| 18 | Lifeline Flywheel | `lifeline-flywheel` | Absent; +0..+5 | [lifeline-flywheel counts actual HP plus Shield damage, not overkill](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 19 | Opal Indexer | `opal-indexer` | Absent; +0..+5 | [opal-indexer only boosts actual native debuff skills](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 20 | Resonance Crucible | `resonance-crucible` | Absent; +0..+5 | [resonance-crucible transfers all named overkill once and does not create native procs](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 21 | Sentinel Aperture | `sentinel-aperture` | Absent; +0..+5 | [sentinel-aperture uses held whole 10-Gauge steps, not a passive Gauge grant](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 22 | Spearwheel Engine | `spearwheel-engine` | Absent; +0..+5 | [spearwheel-engine pierces every skill but never Normal Attack](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 23 | Springwell Pump | `springwell-pump` | Absent; +0..+5 | [springwell-pump classifies healing/Shield abilities, not every skill](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 24 | Twinpulse Bellows | `twinpulse-bellows` | Absent; +0..+5 | [twinpulse-bellows uses recipient capacity and Gauge percentage with formation ties](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 25 | Wardglass Transformer | `wardglass-transformer` | Absent; +0..+5 | [wardglass-transformer boosts critical skills too, and enemy Shield break grants one Normal token](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 26 | Astral Prism | `astral-prism` | Absent; +0..+5 | [astral-prism scales its approved benefit once](../src/content/phase-zero-conduit-stats.test.ts) | 7 passed |
| 27 | Citadel Spine | `citadel-spine` | Absent; +0..+5 | [citadel-spine protects only other living allies strictly below half HP](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 28 | Execution Orrery | `execution-orrery` | Absent; +0..+5 | [execution-orrery is target-local critical chance below 50%, not obsolete execute damage](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 29 | Granite Hourglass | `granite-hourglass` | Absent; +0..+5 | [granite-hourglass measures enemy HP loss, excluding Shields and redirected damage](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 30 | Horizon Heartcase | `horizon-heartcase` | Absent; +0..+5 | [horizon-heartcase pays exactly 40 Gauge once and grants upgraded next-skill Power](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 31 | Immortal Vessel | `immortal-vessel` | Absent; +0..+5 | [immortal-vessel shares effective incoming healing with a fixed recipient HP cap per cast](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 32 | Judgment Lens | `judgment-lens` | Absent; +0..+5 | [judgment-lens boosts only skill critical multipliers](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 33 | Meridian Inverter | `meridian-inverter` | Absent; +0..+5 | [meridian-inverter grants each effectively healed ally percentage Gauge once per turn](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 34 | Nullsong Transmission | `nullsong-transmission` | Absent; +0..+5 | [nullsong-transmission uses the upgraded Normal Attack stat and a fixed Skill Power penalty, never the old attack multiplier](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 35 | Pale Bulwark Diadem | `pale-bulwark-diadem` | Absent; +0..+5 | [Pale buffs another Shield holder, not only another Pale wearer, until the Shield is lost](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 36 | Siege Cantilever | `siege-cantilever` | Absent; +0..+5 | [siege-cantilever boosts all-enemy damaging skills, not single-target skills](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 37 | Starvein Conductor | `starvein-conductor` | Absent; +0..+5 | [starvein-conductor pays once and boosts damage only, not Burn or healing in mixed skills](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 38 | Stasis Reliquary | `stasis-reliquary` | Absent; +0..+5 | [stasis-reliquary treats the impacts of one attack as one threshold total](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 39 | Verdict Caliper | `verdict-caliper` | Absent; +0..+5 | [verdict-caliper checks other living allies spent and boosts skills without banning critical hits](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 40 | Worldbreaker Drive | `worldbreaker-drive` | Absent; +0..+5 | [worldbreaker-drive changes Last Flare Power only, not other skills or a retired AoE override](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 41 | Abyssal Clearwater Parliament | `clearwater-manifold` | Absent; +0..+5 | [clearwater-manifold transfers the upgraded Shield fraction without creating a native layer](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 42 | Abyssal Shelter Observatory | `master-tide-1` | Absent; equipped (fixed) | [master-tide-1](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 43 | Abyssal Surveyor Crown | `master-nerithe-3` | Absent; equipped (fixed) | [master-nerithe-3](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 44 | Accord Seraph Sanctuary | `tranquilitic-accord-bastion` | Absent; +0..+5 | [Accord prevents one fatal enemy hit, grants only a next-skill discount and cannot rescue twice](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 45 | Aegis Covenant Crown | `aegis-return-spring` | Absent; +0..+5 | [Aegis Return follows the source Shield, adding Critical Rate and reducing enemy critical damage](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 46 | Atlas Bastion | `tectonic-atlas-bastion` | Absent; +0..+5 | [tectonic-atlas-bastion grants other allies recipient-capacity Gauge per aimed attack up to its upgraded cap](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 47 | Briar Constellation Loom | `master-sprout-2` | Absent; equipped (fixed) | [master-sprout-2](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 48 | Broken Sky Imperial Metronome | `master-vaelor-3` | Absent; equipped (fixed) | [master-vaelor-3](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 49 | Cinder Testament | `infernic-cinder-testament` | Absent; +0..+5 | [infernic-cinder-testament accumulates allied skill Power additively, caps and retains it on refresh](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 50 | Cinderstar Genesis Engine | `master-ember-2` | Absent; equipped (fixed) | [master-ember-2](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 51 | Concord Planet Thoughtforge | `master-disciple-2` | Absent; equipped (fixed) | [master-disciple-2](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 52 | Crimson Beauty Pyre Requiem | `master-crinso-3` | Absent; equipped (fixed) | [master-crinso-3](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 53 | Crosswind Imperial Drive | `master-atmoso-3` | Absent; equipped (fixed) | [master-atmoso-3](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 54 | Dawn Witness Array | `luminous-dawn-witness-array` | Absent; +0..+5 | [Dawn Witness gives one refreshable next-Attack bonus and expires rather than accumulating strikes](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 55 | Deep Foundation Planetpress | `master-orvella-2` | Absent; equipped (fixed) | [master-orvella-2](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 56 | Duality Planet Flamewheel | `master-crinso-2` | Absent; equipped (fixed) | [master-crinso-2](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 57 | Eclipse Mantle | `ominous-eclipse-mantle` | Absent; +0..+5 | [Eclipse ignores Weakened Defense and adds target-only Power without consuming Weaken](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 58 | Eclipse Planet Watchtower | `master-razor-2` | Absent; equipped (fixed) | [master-razor-2](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 59 | Ember Coronation Iris | `flare-focusing-iris` | Absent; +0..+5 | [Iris extends only authored Burn and gives other allies the target-dependent Critical Rate](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 60 | Eternal Cinder Observatory | `cinder-metering-nozzle` | Absent; +0..+5 | [Cinder Nozzle releases remaining Burn as one capped Bonus Strike, not another Burn](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 61 | Evergreen Continuance Crucible | `master-sprout-3` | Absent; equipped (fixed) | [master-sprout-3](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 62 | Faultkeeper Loom | `tectonic-faultkeeper-loom` | Absent; +0..+5 | [Faultkeeper shares personal effective Defense without recursive or duplicate squad-aura inflation](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 63 | Final Chord Celestial Resonator | `master-vaelor-1` | Absent; equipped (fixed) | [master-vaelor-1](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 64 | Final Dawn Tribunal | `master-aurora-1` | Absent; equipped (fixed) | [master-aurora-1](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 65 | Firstlight Concordance | `firstlight-cam` | Absent; +0..+5 | [Firstlight adds upgraded Gauge Gain once to existing Gain and expires after turn two](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 66 | Folded Ocean Planetarium | `master-nerithe-2` | Absent; equipped (fixed) | [master-nerithe-2](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 67 | Forbidden Garden Worldlock | `master-thornia-1` | Absent; equipped (fixed) | [master-thornia-1](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 68 | Fractured Mercy Governor | `tension-governor` | Absent; +0..+5 | [Tension gives one injured ally Defense and a bounded heal, not additional Weaken potency](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 69 | Golden Thorn Judgment Loom | `master-rosetta-3` | Absent; equipped (fixed) | [master-rosetta-3](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 70 | Griffin Turbine | `atmospheric-griffin-turbine` | Absent; +0..+5 | [Griffin uses total HP damage, recipient capacity and Gain, with an upgraded capacity cap](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 71 | Helios Pyre Cathedral | `master-ember-1` | Absent; equipped (fixed) | [master-ember-1](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 72 | Horizon Cyclone Orrery | `master-atmoso-2` | Absent; equipped (fixed) | [master-atmoso-2](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 73 | Infinite Thunderwheel Arsenal | `master-elise-1` | Absent; equipped (fixed) | [master-elise-1](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 74 | Keystone Sovereign Counterweight | `master-orvella-3` | Absent; equipped (fixed) | [master-orvella-3](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 75 | Kirin Cradle | `tranquilitic-kirin-cradle` | Absent; +0..+5 | [Kirin heals from effective Defense with its recipient-HP cap and full-HP Gauge alternative](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 76 | Leviathan Mercy Reflector | `tidebound-reflector` | Absent; +0..+5 | [tidebound-reflector reflects source-owned absorption across recipients with a shared Enemy Turn cap](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 77 | Leviathan Pump | `aquatic-leviathan-pump` | Absent; +0..+5 | [aquatic-leviathan-pump grants its Shield recipient Gauge with a per-recipient Enemy Turn cap and no old healing](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 78 | Leviathan Ward Loom | `ward-stitch-spool` | Absent; +0..+5 | [ward-stitch-spool buffs support skills only while a source Shield remains and adds one fixed Enemy Turn](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 79 | Living Worldwall Atlas | `master-bruno-1` | Absent; equipped (fixed) | [master-bruno-1](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 80 | Merciful Eclipse Regulator | `master-aurora-3` | Absent; equipped (fixed) | [master-aurora-3](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 81 | Nightglass Archive | `ominous-nightglass-archive` | Absent; +0..+5 | [Nightglass marks only damaging skills, buffs other-ally Normals and expires after two turns](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 82 | Nightglass Counterblade Engine | `master-razor-3` | Absent; equipped (fixed) | [master-razor-3](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 83 | Ocean Memory Worldpump | `master-tide-2` | Absent; equipped (fixed) | [master-tide-2](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 84 | Ouroboros Core | `chaotic-ouroboros-core` | Absent; +0..+5 | [chaotic-ouroboros-core creates upgraded generated Shields for two fixed Enemy Turns after Last Flare](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 85 | Paradox Spindle | `chaotic-paradox-spindle` | Absent; +0..+5 | [Paradox buffs only other allies during recovery and does not allow recovery Normals](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 86 | Phoenix Lifeforge | `emberlife-kiln` | Absent; +0..+5 | [Emberlife increases squad received healing only during its own Burn, without a Burn-triggered heal](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 87 | Phoenix Reactor | `infernic-phoenix-reactor` | Absent; +0..+5 | [infernic-phoenix-reactor revives once with upgraded HP and a finite generated squad Shield](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 88 | Phoenix Temper Dominion | `tempered-strike-link` | Absent; +0..+5 | [Tempered exchanges one received-skill-heal Attack bonus for the healer next-skill Efficiency](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 89 | Prismseal Astral Judiciary | `master-aurora-2` | Absent; equipped (fixed) | [master-aurora-2](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 90 | Pyre Census Requiem | `infernic-pyre-census` | Absent; +0..+5 | [Pyre Census counts distinct living elements and buffs only other-element allies](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 91 | Quarry Planet Gravitas | `master-bruno-2` | Absent; equipped (fixed) | [master-bruno-2](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 92 | Quiet Heaven Fanforge | `master-bliss-3` | Absent; equipped (fixed) | [master-bliss-3](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 93 | Rose Beyond the Sun Orrery | `master-rosetta-1` | Absent; equipped (fixed) | [master-rosetta-1](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 94 | Rosefault Precision Sovereign | `chaotic-fault-verdict` | Absent; +0..+5 | [Fault Verdict buffs Shielded critical damage and rewards the supplier once per turn without consuming Shield](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 95 | Ruinselect Fracture Parliament | `ruinselect-prism` | Absent; +0..+5 | [Ruinselect retains low-HP Power through an allied heal for one action only](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 96 | Secondbeat Rupture Throne | `secondbeat-rack` | Absent; +0..+5 | [Secondbeat holds one damaged target and grants the source Gauge only when the damaging skill uses it](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 97 | Seraph Mirror | `luminous-seraph-mirror` | Absent; +0..+5 | [Seraph heals each recipient from their own max HP once per turn, not per target](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 98 | Shadow Rose Sovereign Foundry | `master-thornia-3` | Absent; equipped (fixed) | [master-thornia-3](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 99 | Shared Tide Lifesea Engine | `oceanic-shared-tide-pump` | Absent; +0..+5 | [Shared Tide copies a single-target skill Shield at its scaled size and same expiry, with no damage-network sharing](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 100 | Shoreless Meridian Worldchart | `master-nerithe-1` | Absent; equipped (fixed) | [master-nerithe-1](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 101 | Sky Sovereign Escapement | `pulse-trigger-pawl` | Absent; +0..+5 | [pulse-trigger-pawl grants percentage Gauge once per critical skill turn, not per target or Normal](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 102 | Sky Without End Turbine | `master-atmoso-1` | Absent; equipped (fixed) | [master-atmoso-1](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 103 | Skythread Rudder | `atmospheric-skythread-rudder` | Absent; +0..+5 | [Skythread selects Gauge percentage, refreshes one ordinary-skill discount and does not discount Last Flare](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 104 | Solace Witness Monolith | `solace-anchor` | Absent; +0..+5 | [Solace grants other allies this-turn Attack without free Normals or Gauge costs](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 105 | Sootwake Phoenix Mirror | `sootwake-crucible` | Absent; +0..+5 | [Sootwake holds one target bonus per other ally, consumed by their next action without stacking Burn ticks](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 106 | Sovereign Will Amplifier | `master-disciple-3` | Absent; equipped (fixed) | [master-disciple-3](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 107 | Stillhour Carillon | `tranquilitic-stillhour-carillon` | Absent; +0..+5 | [tranquilitic-stillhour-carillon grants the recovery-turn heal/Gauge only during recovery](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 108 | Stillplume Planetary Ballet | `master-bliss-2` | Absent; equipped (fixed) | [master-bliss-2](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 109 | Storm Empress Execution Clock | `master-elise-3` | Absent; equipped (fixed) | [master-elise-3](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 110 | Stormstep Dynamo | `voltaic-stormstep-dynamo` | Absent; +0..+5 | [voltaic-stormstep-dynamo boosts the switched skill and the next different caster, not an obsolete damage multiplier](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 111 | Tempest Return Chronarch | `atmospheric-storm-clock` | Absent; +0..+5 | [Storm Clock counts critical Attack Actions, not AoE impacts, and holds one next-Last-Flare discount](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 112 | Tempest Shelter Sovereign | `pressurecrest-governor` | Absent; +0..+5 | [Pressurecrest grants one timed injured-ally Shield per turn, never the retired dodge](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 113 | Thousand-Rose Planetary Aegis | `master-thornia-2` | Absent; equipped (fixed) | [master-thornia-2](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 114 | Thousandfeather Zenith Loom | `master-bliss-1` | Absent; equipped (fixed) | [master-bliss-1](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 115 | Throne Beneath the World | `master-orvella-1` | Absent; equipped (fixed) | [master-orvella-1](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 116 | Thunder Choir Planetary Fugue | `master-vaelor-2` | Absent; equipped (fixed) | [master-vaelor-2](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 117 | Thunderbird Coil | `voltaic-thunderbird-coil` | Absent; +0..+5 | [Thunderbird arcs once from primary skill HP damage, or grants other allies the fallback](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 118 | Twin Star Planetary Ratchet | `master-elise-2` | Absent; equipped (fixed) | [master-elise-2](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 119 | Twin-Rose Singularity Drive | `master-crinso-1` | Absent; equipped (fixed) | [master-crinso-1](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 120 | Unbound Mindcrown Synapse | `master-disciple-1` | Absent; equipped (fixed) | [master-disciple-1](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 121 | Unbroken Midnight Bastion | `master-razor-1` | Absent; equipped (fixed) | [master-razor-1](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 122 | Unbroken Sunforge Throne | `master-ember-3` | Absent; equipped (fixed) | [master-ember-3](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 123 | Undertide Chronometer | `aquatic-undertide-chronometer` | Absent; +0..+5 | [Undertide extends Weaken and discounts another ally against the chosen Weakened target only](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 124 | Undertow Sovereign Harpoon | `master-tide-3` | Absent; equipped (fixed) | [master-tide-3](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 125 | Verdant Covenant | `efflorescent-verdant-covenant` | Absent; +0..+5 | [Verdant grants one next-damaging-skill Power token only on effective skill healing](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 126 | Virtuous Planet Rosegarden | `master-rosetta-2` | Absent; equipped (fixed) | [master-rosetta-2](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 127 | Worldforge Hammer Dominion | `master-bruno-3` | Absent; equipped (fixed) | [master-bruno-3](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 128 | Worldgrove Covercharge Heart | `covercharge-drum` | Absent; +0..+5 | [Covercharge gives the next different skill caster one mixed-skill bonus, not every ally](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 129 | Worldroot Graft Coronation | `botanic-graft-covenant` | Absent; +0..+5 | [Graft adds healing Power rather than multiplying it and grants Defense after crossing 40% HP](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 130 | Worldroot Sap Cathedral | `mending-valve` | Absent; +0..+5 | [Mending heals the lowest HP-percentage ally from total skill HP damage, with a per-cast cap](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 131 | Worldroot Triage Sanctuary | `rootbound-triage-vault` | Absent; +0..+5 | [rootbound-triage-vault selects the most injured and expires after any next action](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 132 | Worldseed Mercy Foundry | `master-sprout-1` | Absent; equipped (fixed) | [master-sprout-1](../src/game/phase-zero-master-matrix.test.ts) | 2 passed |
| 133 | Worldtree Heart | `efflorescent-worldtree-heart` | Absent; +0..+5 | [Worldtree creates a capped timed replacement Shield, not an accumulating heal reserve or generic overheal Shield](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 134 | Cathedral of the Final Equation | `calamitic-cathedral-final-equation` | Absent; +0..+5 | [calamitic-cathedral-final-equation grants upgraded living-squad Power and Efficiency once across duplicate sources](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 135 | Causality Funeral Engine | `calamitic-causality-funeral-engine` | Absent; +0..+5 | [calamitic-causality-funeral-engine grants upgraded additive Power and removes Last Flare recovery only](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 136 | Horizon-Cleaving Godpress | `calamitic-horizon-cleaving-godpress` | Absent; +0..+5 | [Godpress ignores the upgraded share of Defense and bypasses the upgraded Shield share for skills, not Normals](../src/game/phase-zero-replacement-effects.test.ts) | 7 passed |
| 137 | Throne of Borrowed Tomorrows | `calamitic-throne-borrowed-tomorrows` | Absent; +0..+5 | [calamitic-throne-borrowed-tomorrows grants spent nonrecovering recipients exactly one extra skill per player turn](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
| 138 | World-Eater's Orrery | `calamitic-world-eater-orrery` | Absent; +0..+5 | [calamitic-world-eater-orrery heals every living ally from each skill total, not Normals or a once-turn limit](../src/game/phase-zero-remaining-effects.test.ts) | 7 passed |
