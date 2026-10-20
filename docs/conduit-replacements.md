# Redundant Conduit replacements (D-349 proposal, implemented D-351)

Status: **implemented (D-351).** The owner approved all ten with current names and these numbers.
Horizon Heartcase adds +10 Gauge to each later save in a Battle so the drain always runs out.

The owner wants new build-crafting axes instead of more Conduits that buff the same
thing (Skill 1/Skill 2 damage, flat Normal Attack damage, Burn %, Shield %). Each
row below replaces a Conduit whose current effect is already covered, often better, by
another Conduit. Stable IDs, art, ownership, upgrade levels, rarity, acquisition
and the Omnic element locks stay unchanged; only the effect (and optionally the
display name) changes. Numbers are +0 -> +5 upgrade ranges.

## Flow-breaking caps (implemented with this proposal)

D-334 removed trigger limits, which let four effects cheat death on every Enemy
Turn. Each now works the first time each Battle (per stage/wave):
Stasis Reliquary, Phoenix Reactor, Accord (once per ally) and the Flora Master
Worldseed revive. A per-turn cap would not fix this, because the lethal hit
arrives every Enemy Turn.

## Proposed replacements

| # | Replace (rarity) | Why it is redundant | New effect |
|---|---|---|---|
| 1 | Fieldbrace Coupler (Common) | Shielded damage reduction overlaps Pale Bulwark, Sentinel Aperture and Atlas Bastion. | When a Shield on you breaks, restore 6% -> 12% of your maximum HP at the start of your next player turn. |
| 2 | Reserve Torque Crank (Common) | Flat Normal Attack Gauge overlaps Griffin Turbine, Aegis Capacitor and Pulse-Trigger Pawl. | Whenever you gain Gauge, gain +10% -> +25% more (at least +1). Gauge moved by Conduits is excluded. |
| 3 | Twinpulse Bellows (Rare) | Now a plain +25-50% [Normal Attack] bonus: a strictly stronger Siegebound Drive. | Begin each Battle with 15% -> 35% of your Gauge capacity filled (adds to Fracture Reservoir). |
| 4 | Coilfeed Ratchet (Rare) | [Skill 2]-only discount; Skythread Rudder and Storm Clock already cut costs. | All your abilities cost 8% -> 16% less Gauge (rounded down). [Last Flare] cannot fall below 70. |
| 5 | Resonance Crucible (Rare) | Plain [Burn] %, beaten by Pyre Census, Cinder Testament and Starvein Conductor. | Damage beyond what defeats an enemy carries to the healthiest other enemy as a Bonus Strike at 30% -> 60%. |
| 6 | Glassroot Gimbal (Rare) | Third Critical Rate source after Parallax Relay and Falcon Sight. | Attack Actions deal +1% -> +2% Direct Damage per 10 Gauge you hold before paying costs. |
| 7 | Horizon Heartcase (Legendary) | +HP/-Defense trade overlaps Immortal Vessel's +HP/-Attack. | When Direct Damage would defeat you, the excess drains your Gauge instead: 1 Gauge per 1% maximum HP, reduced by 20% -> 50%, plus 10 for each earlier save this Battle. If your Gauge covers it all you stay at 1 HP; otherwise you fall. |
| 8 | Leviathan Ward Loom `ward-stitch-spool` ([Oceanic] Omnic) | Now "+25-50% Shield size", the same as Wardglass Transformer. | Allies holding your Shield receive +20% -> +40% more healing from every source. |
| 9 | Worldgrove Covercharge Heart `covercharge-drum` ([Botanic] Omnic) | Overheal redirection; all overhealing already becomes a Shield, and Worldtree Heart stores it. | When another ally falls, each living ally restores 10% -> 20% of their maximum HP and gains 20 -> 40 Gauge. |
| 10 | Firstlight Concordance `firstlight-cam` ([Tranquilitic] Omnic) | Normal Attack Gauge transfer, beaten by Griffin Turbine (gives Gauge without the cost). | During the first Enemy Turn of each Battle, all allies take 25% -> 50% less Direct Damage. |

## New axes covered

Gauge economy (gain %, starting fill, cost %, Gauge hoarding), Gauge as a last
defence, Shield-break recovery, overkill, incoming healing, ally death and
the opening Enemy Turn. None duplicates an existing Skill 1/Skill 2/Normal
Attack/Burn/Shield % bonus.

## Owner answers (D-351)

- All ten approved and live; current display names kept; numbers unchanged.
