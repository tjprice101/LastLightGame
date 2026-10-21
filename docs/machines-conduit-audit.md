# Machines Conduit overlap audit (D-352)

Scope: every Rare, Legendary and Omnic Conduit from Awaken the Machines,
compared against the full catalog (Common, Machines, kit and Calamitic).

Rules from the owner:

- Two Conduits that overlap: rework one into something new that overlaps nothing.
- Exception: a higher rarity may repeat a lower-rarity effect if it does it better.
- A +Stat/-Stat trade-off must not contradict itself and must beat a plain +Stat.

## Reworked

| Conduit | Rarity | Problem | New effect (+0 -> +5) |
| --- | --- | --- | --- |
| Breach Pendulum | Rare | Same trigger and value as Lifeline Flywheel | Attack Actions deal +20% -> +40% Direct Damage to enemies at full HP |
| Stasis Reliquary | Legendary | Survive-at-1-HP + Shield, duplicated Heartcase/Accord | Damage from one enemy hit above 20% max HP reduced by 30% -> 60% |
| Faultkeeper Loom | Omnic | Normal Attack draws damage, duplicated Atlas Bastion | Other allies gain Defense equal to 15% -> 30% of yours while you stand |
| Pyre Census | Omnic | +% [Burn], duplicated Cinder Testament | +10% -> +20% Direct Damage per enemy with your [Burn] |
| Flare Focusing Iris | Omnic | [Burn] Bonus Strike, duplicated Tempered Strike Link | Each [Burn] phase consumed by [Flame Arc] extends your remaining [Burn] on each enemy +1 -> +2 Enemy Turns (D-359: authoritative stored duration, not only its snapshot) |
| Ruinselect Prism | Omnic | Spent and duplicated Nightglass [Fractures] | +3% -> +6% Direct Damage per 10% of your max HP missing |
| Astral Prism | Legendary | Elemental Damage only feeds [Burn]; overlapped Starvein | +20 -> +70 points Critical Rate, -6% -> -21% Defense; Critical Rate above 100% becomes Elemental Crit chance |
| Citadel Spine | Legendary | Elemental Damage penalty meaningless for most | +25% -> +87.5% Defense, -6 -> -21 points Critical Rate (Shield rider unchanged) |
| Solace Anchor | Omnic | Damage-reduction rider duplicated Atlas Bastion | First [Normal Attack] each player turn costs 10 -> 5 Gauge and keeps your action; rider removed |
| Graft Covenant | Omnic | Same numbers as Rare Springwell Pump, narrower | [Seeds] store +50% -> +100% healing |
| Horizon Heartcase | Legendary | Undocumented +HP/-Defense bundle | Bundle removed; documented Gauge-as-HP effect only |

Trade-offs: Astral and Citadel penalties sit on a different stat from their bonus,
and each bonus is larger than any plain single-stat Conduit of its rarity.

## Kept (higher rarity does it better, or different axis)

- Twinpulse vs Fracture Reservoir; Nullsong vs Siegebound; Immortal Vessel vs Vigil Core;
  Eclipse Mantle vs Spearwheel; Thunderbird vs Resonance.
- Skythread and Storm Clock vs Coilfeed; Pyre/Cinder vs Starvein; Seraph vs Lifeline.
- Judgment Lens vs Verdict Caliper; Ward Loom vs Springwell; Hammerbalance.
- Team-Gauge Conduits (distinct triggers); Aegis Capacitor, Tidebound and Leviathan Pump
  (Shield absorption with different outputs).
- Dawn Witness vs Fault Verdict; Aegis Return Spring vs Sentinel Aperture.
- [Weaken] family: duration, strength, delay, pierce and transfer are separate axes.
- Phoenix Reactor vs Heartcase: revive once vs Gauge-as-HP.

## Balance note

The late benchmark squad previously relied on Heartcase's hidden +70% HP at +5.
It now uses Stasis Reliquary in that slot; built squads still clear every final
ordinary boss and still lose to Roses and Elemental War.

## Endgame trims (D-353)

120 seeded runs of the late benchmark squad against the Roses final stage and the War stage-10 bosses, one Conduit swapped into slot 6. Baseline loadout: 11/120 wins.

| Conduit | Before | After | Wins before -> after |
|---|---|---|---|
| Starvein Conductor | [Burn] +40% -> +80% | +30% -> +60% | 24 -> 17 |
| Granite Hourglass | Shield 30% -> 60% | 20% -> 40% | 44 -> 18 |
| Coilfeed Ratchet | Cost -8% -> -16% | -7% -> -14% | 10 -> 8 |

Unchanged: Reserve Torque Crank (within noise), Worldbreaker Drive (26/120 even with no [Last Flare] bonus, so the bonus is not the cause) and Calamitic Causality Funeral Engine.
