# Elemental War Phase 2: four artwork-led character designs

**Owner-requested design/prompt scope only (2026-11-06). Names and numeric designs are proposals; no playable registration, acquisition or authority changes.**

[Associated prompt pack](../Art/characters/Elemental%20War%20Phase%202.md) | [Existing War rules](elemental-war.md) | [Global benchmark boundary](enemy-benchmark-calibration.md) | [Source provenance](../Art/provenance/phase2-war-source-mapping.json).

Reproduce this specification and the prompt pack: `python tools/build_phase2_war_art.py`.

## Reuse, not replacement

The 24 supplied root portraits become four new proposed War identities. Current Moon names, kits and save IDs remain intact; their new lunar prompt directions are separate. Originals are archived byte-for-byte with original filenames, new identity/form mapping and SHA-256. Root files stay until reviewed intake is approved. No automatic key removal, source repaint, runtime PNG or reveal URL is created. Source edge clipping, hairstyle drift and weapon changes are recorded below instead of falsely claiming perfect six-form continuity.

These are mortal human Element-Bearers in Let's image. Wings are elemental manifestations and craft, not divine species. Neither creator's soul is recovered and no faction wins. The four identities are not members of the Moon order and have no seasonal summon placement.

## Shared proposed gameplay contract

- Six-star, six forms, Lv.0/Evo.1 and unequipped on future acquisition; no starter grants.
- Existing War template: 10 free sequential stages, authored Lv.90-140 curve; bosses use shared hostile definitions, not playable role perks or personal Master mechanics.
- Stage10 would guarantee that trial's bearer, or the current 100 Null-Prismatica owned conversion. Current currency rules/receipt atomicity retained; no trial materials, captures or summon pool. Prismatica grows linearly from1500-2500 at1 to30000-45000 at10, with no final multiplier. Null-Prismatica chance grows30%-60%; quantity follows the existing round(1+4*(stage-1)/9), with final5x quantity retained.
- Ordinary same-element progression materials and existing Heaven/Abyss fodder associations apply; no new material family is needed just because the art was reused.
- Normal: 100% Direct Attack to one enemy, +20 Gauge; shared Defense and action legality.
- Skill1/2 base costs25/40, cooldown0; Last Flare100 and real next-player-turn recovery. Existing Skill Efficiency adjusts costs, Skill Power scales native damage/healing/Shield unless explicitly excepted. Stat/Gauge/counter bonuses are fixed, not implicitly scaled by Skill Power. Direct damage follows existing Defense/critical math.
- Existing role perks: Tank +50% Defense and 1.25 random-target weight; Attacker +100% Direct Attack/+50 percentage points Skill Power; Support/Healer & Support +50% Health/+25 percentage points Skill Power and shared 4% squad healing after ordinary Skills/Last Flare.
- All base stats below are before role/gear and use existing fractional growth/caps. Gauge capacity and critical multiplier remain their existing growth domains.
- Named resources start empty and reset each encounter. Capped native counters have no account field; frozen Settings/session state retains counters and guards. HP resets between stages and Gauge carries over, while owned loadout/progression stay frozen.
- Buff durations use current per-owner turn clocks; apply/refresh, never multiply-stack the same source. Taunt affects eligible random single-target attacks, not scripts/AoE.
- No new RNG beyond existing critical outcomes. Triggered healing/Shield/Conduit output does not recursively generate native counters unless explicitly allowed. All effects require living owners/targets; no revive or negative Health.
- One personal Master at a time, three alternatives per bearer, same future chest-choice mechanism. No new drop chance, Calamitic tier or automatic equip.

### Proposed trial stage/form map

The existing shared War curve, not a new authored difficulty table:

| Stage | Enemy level | Portrait form |
|---:|---:|---|
| 1 | 90 | Common |
| 2 | 96 | Common |
| 3 | 101 | Uncommon |
| 4 | 107 | Uncommon |
| 5 | 112 | Rare |
| 6 | 118 | Rare |
| 7 | 123 | Epic |
| 8 | 129 | Epic |
| 9 | 134 | Legendary |
| 10 | 140 | Omnic |

## Numeric review boundary

The designs deliberately offer substantial 25-60% useful buffs and meaningful funded payoffs, not tiny decorative boosts. This is not a balance certification: run non-Calamitic paper damage, effective healing, Shield creation, packet survival and actual pressured War encounters separately before approving numeric implementation. A trio is conditional on ownership, not an average account; only one starter is guaranteed. Do not tune enemies to these proposals or claim measured clear rates.

## Neralis — proposed six-star Oceanic Healer & Support

**Identity:** The current that returns for the last traveler.

**Origin:** The river stations of the Broken Weirs.

**Lore:** Neralis once measured rivers for a council that drew borders where bridges should have been. When a broken weir stranded both banks, he used his crescent polearm to pull the rescue lines across, then returned until the crossing was empty. He keeps amber station lights on his coat so a traveler can recognize a guide before understanding a map. His dark wings are folded river-shadow plumes; the bright blue current follows his weapon rather than a distant moon. Oceanic Sadness teaches him to remember each abandoned crossing without accepting abandonment as its future. A human Element-Bearer created by Let, he follows the still-unfound creator's trail between repair journeys. He offers the squad a trial in which success means sustaining the crossing, not merely overpowering its keeper.

**Vow:** A road is not finished until it brings someone back.

### Appearance authority

crescent-hook polearm and spear-ended dark shaft, silver collar ribs, split white coat panels over black armor, amber station-token clasps and swept black feather relief; cyan-blue water channels.

**Palette:** black and white coat panels, silver steel, amber-gold station clasps; bright cyan-blue water and white foam. Hair/weapon differences in the supplied stages below are retained, not silently repainted.

| Form | Original root filename | New display name | Supplied appearance / review notes |
|---|---|---|---|
| Common | `Ferry-Token Keeper, Maerion.png` | Weirline Guide, Neralis | Silver-blue swept hair, dark trailing ponytail plume, black armor and white split coat; dark-shaft crescent polearm. Modest amber boot fittings. Source blade approaches the left frame edge. |
| Uncommon | `Crescent Field Medic, Maerion.png` | Keeper of the Amber Stations, Neralis | Silver-white side fringe, long dark tied tail, white high coat, black gloves and red-brown boots; crescent polearm carries a cyan water/crystal formation. Keep that cyan subject detail, not green-key spill. |
| Rare | `Ribs of the Returning Tide, Maerion.png` | A Crossing Remembered, Neralis | Silver-gray fringe and long tied dark hair, black-white split coat and one large dark swept wing silhouette; spear-shaped polearm end, silver ribs and amber belt clasp. Weapon shape differs visibly from the first form. |
| Epic | `Steward of Unfinished Voyages, Maerion.png` | Wings Above the Broken Weir, Neralis | Short silver hair, two large dark wings, silver-black plated coat and amber shoulder/boot tokens; spear-like polearm across a blue water crescent. Not a grayscale water healer. |
| Legendary | `Harbor for the Unreturned, Maerion.png` | Return Against the Current, Neralis | Dark-silver swept hair, broad black wings, longer white panel trains and amber tokens; crescent hook and opposite spear point over a bright blue returning current. |
| Omnic | `Every Name Carried Home, Maerion.png` | The River Keeps Its Promise, Neralis | Long silver hair and curling side locks, ornate dark feather wings and layered white-black admiral coat; amber fittings and blue water spirals around a double-ended polearm. Actual wing/weapon tips need intake clearance review. |

### Base stats

| Health | Defense | Direct Attack | Critical Rate | Gauge capacity | Critical multiplier | Elemental Damage |
|---:|---:|---:|---:|---:|---:|---:|
| 240 | 12 | 32 | 12% | 100 | 150% | 0 |

### Passive: Returning Current

Gain 1 [Current], up to 3, when Neralis's Normal Attack deals direct damage or his native ability restores Health. Gain at most 1 per action.

### Normal Attack

Deal 100% of Direct Attack to one enemy. Gain 20 Gauge. Shared Defense, critical and action rules apply.

### Skill 1: Light the Next Station

**25 Gauge**

Restore 35% maximum Health to one living squad member, scaled by Neralis's Skill Power. Grant that member +30% Defense for 2 turns.

### Skill 2: Carry Them Back

**40 Gauge**

Spend all [Current]. Restore 18% maximum Health to each living squad member, plus 6% per [Current] spent, scaled by Neralis's Skill Power.

### Last Flare: No Crossing Left Empty

**100 Gauge | Recover next player turn**

Spend all [Current]. Deal 720% of Neralis's Direct Attack to all enemies. Restore 30% maximum Health to each living squad member, plus 5% per [Current] spent, scaled by his Skill Power.

### Master: Amber-Station Return Manifold

**+60% Health | +35 percentage points Skill Power**

Increase maximum [Current] to 4. Increase Carry Them Back's healing per [Current] from 6% to 9% maximum Health.

**Art direction:** a magnificent crescent-hook manifold, four amber station capsules, silver return gears and three cyan-blue water turbines inside black-white prow-panel shutters.

### Master: Blackwing Crossing Stabilizer

**+50% Health | +60% Defense**

After Light the Next Station, grant its target a Shield equal to 20% maximum Health, scaled by Neralis's Skill Power.

**Art direction:** a colossal swept black feather-rib stabilizer, silver crescent braces and amber bearings; cyan-blue water pressure lifts interlocking white rescue plates.

### Master: Weirheart Recollection Dynamo

**+40% Health | +40% Direct Attack | +25 percentage points Skill Power**

When a native heal restores Health to an ally below 50% Health before that heal, restore 10% maximum Gauge to that ally. Once per round per ally; excludes the shared Support perk and Conduit healing.

**Art direction:** a vast amber station-heart rotor between paired silver crescent impellers, cyan-blue capillary channels and black-white coat-panel relief; three separate return axles.

### Strengths, costs and proposed trial

**Strengths:** Reliable single-target rescue, Current-funded squad healing and a useful non-Calamitic Oceanic sustain choice. Healing is based on actual restored Health; no free Gauge from overheal.

**Limits:** Low unperked base Attack, no revive or cleanse, and a real ultimate recovery turn. Current is earned, not preloaded; healing and Gauge-return Masters compete for the one personal Master slot.

**Pilot rotation:** Normal -> Skill 1 on a wounded ally -> Normal -> Skill 2; save 3 Current for the Last Flare when the squad needs a larger recovery.

**War activity:** Passage of the Returning River. Header and arena borrow the actual equipment/material motifs above, not the current Moon event scenery. Trial name differs from identity and Omnic title.

## Varkhel — proposed six-star Infernic Tank

**Identity:** Wrath held on a chain instead of unleashed.

**Origin:** The chainworks above Cinderfall Span.

**Lore:** Varkhel was paid to sever the suspension chains of an occupied bridge. Instead he fastened his counterweight to its failing hinge and held the retreat open. The red sash remembers the warning cloth tied to that hinge, not a royal title. His armor grew around the strain: silver joint plates, black wing mantles and, later, scarlet furnace enamel. The weight carries an orange fault star with violet pressure at its rim. Infernic Wrath is the anger he refuses to spend on the people he is protecting. He is a mortal bearer of Let's making, not a fallen creator. He seeks the missing creator through ruined chainworks, testing whether a squad can hold its formation when the first safe answer is to yield.

**Vow:** Let the chain answer the blow, not the people behind me.

### Appearance authority

dark spherical chained counterweight with silver collar and orange fault-star inset, articulated silver chain, scarlet sash and plate joins, black feather-rib mantle and brass latch fittings; violet pressure rim confined to the weight.

**Palette:** black wing mantles, white and silver joint plates, scarlet enamel and red cloth, brass-gold fasteners; orange-amber fault fire with a narrow violet pressure rim. Hair/weapon differences in the supplied stages below are retained, not silently repainted.

| Form | Original root filename | New display name | Supplied appearance / review notes |
|---|---|---|---|
| Common | `Observatory Sentinel, Caevren.png` | Chainwork Holdfast, Varkhel | Swept dark hair, pale gray eyes, magenta-red trousers under black-white armor, gold collar detail and black feather mantle; smooth dark chained sphere on a long handle. No observatory uniform is claimed. |
| Uncommon | `Keeper of the Counterweight, Caevren.png` | The Warning Cloth, Varkhel | Dark jagged hair, red scarf and white plated armor under black feather wings; smooth dark sphere with a small orange fissure. Source hand/chain layout remains authoritative. |
| Rare | `The Meridian Holds, Caevren.png` | Weight Against the Breach, Varkhel | High tied dark hair, red scarf and gold-edged white coat, silver segmented armor; spiked counterweight and one trailing chain. Spike change is preserved as this War line's serrated collar, not copied into Moon Caevren. |
| Epic | `Brace Beneath the Falling Sky, Caevren.png` | A Span Held Open, Varkhel | Short dark hair, heavy black wings and silver joint armor, long white coat tails; smooth sphere carries vivid orange molten fractures. This form restores the smooth core rather than pretending all silhouettes are identical. |
| Legendary | `Anchor of the Unfinished Night, Caevren.png` | Wrath Within the Hinge, Varkhel | Long red-black swept hair, scarlet/black/silver regalia, brass borders and black wings with blue painted edge highlights; orange central fault star in a caged weight. Hair color shift is supplied, not a new prompt instruction. |
| Omnic | `No Star Falls Unheld, Caevren.png` | The Chain Refuses to Break, Varkhel | Dark hair returns beneath angular crown armor, broad white blade-like rear panels and torn red mantle; black sphere with orange star and violet rim on a silver chain. Entire spear/wing/chain silhouette needs edge review. |

### Base stats

| Health | Defense | Direct Attack | Critical Rate | Gauge capacity | Critical multiplier | Elemental Damage |
|---:|---:|---:|---:|---:|---:|---:|
| 305 | 21 | 33 | 10% | 100 | 150% | 0 |

### Passive: Tension Held

Gain 1 [Tension], up to 4, when an enemy direct attack damages Varkhel's Health or Shield, once per enemy phase. His damaging Normal Attack also grants 1 [Tension].

### Normal Attack

Deal 100% of Direct Attack to one enemy. Gain 20 Gauge. Shared Defense, critical and action rules apply.

### Skill 1: Set the Warning Chain

**25 Gauge**

Grant Varkhel a Shield equal to 25% maximum Health, scaled by his Skill Power. Gain +40% Defense for 2 turns and Taunt for the next enemy phase.

### Skill 2: Return the Strain

**40 Gauge**

Spend all [Tension]. Deal 285% of Varkhel's Direct Attack to one enemy, plus 45% per [Tension] spent. Ignore 20% of that enemy's Defense.

### Last Flare: The Bridge Holds Behind Me

**100 Gauge | Recover next player turn**

Spend all [Tension]. Deal 690% of Varkhel's Direct Attack to all enemies, plus 55% per [Tension] spent. Grant each living squad member a Shield equal to 30% maximum Health, scaled by his Skill Power.

### Master: Faultstar Chain Accumulator

**+70% Health | +50% Defense**

Increase maximum [Tension] to 5. Gain +10% Defense per stored [Tension].

**Art direction:** an immense scarlet-black chain accumulator, five amber pressure cylinders, silver counterweight gears and a dark fault-star sphere edged violet inside white collar shutters.

### Master: Scarlet-Hinge Load Distributor

**+50% Health | +35 percentage points Skill Power**

After Set the Warning Chain, grant each other living squad member a Shield equal to 16% maximum Health, scaled by Varkhel's Skill Power.

**Art direction:** a colossal silver load hinge with scarlet warning-panel fins, three orange-amber pressure outlets and black feather-rib counterbalances, articulated chain drums.

### Master: Recoil-Star Compression Turbine

**+45% Direct Attack | +50% Health**

Increase Return the Strain's Defense ignore from 20% to 35%. When it spends at least 3 [Tension], restore 15% of Varkhel's maximum Gauge after its cost.

**Art direction:** a massive black counterweight recoil turbine, violet-rimmed orange fault star, scarlet compression shutters and silver toothed return axles linked by one chain circuit.

### Strengths, costs and proposed trial

**Strengths:** A damage-fed and Normal-fed tank with deliberate stored-pressure offense, strong short defensive setup and a meaningful piercing strike.

**Limits:** No passive immortality, no Burn from visual fire, no automatic retaliation and no redirection of scripted/AoE attacks. Spending Tension trades away the storage Master's Defense.

**Pilot rotation:** Skill 1 -> enemy pressure -> Normal -> Skill 2 with 3-4 Tension; reserve a funded Last Flare for squad shielding through its recovery phase.

**War activity:** Trial of the Suspended Chain. Header and arena borrow the actual equipment/material motifs above, not the current Moon event scenery. Trial name differs from identity and Omnic title.

## Seravelle — proposed six-star Infernic Support

**Identity:** A signal raised for people, not for conquest.

**Origin:** The ash-white courier roads of Bellmarch.

**Lore:** Seravelle carried route orders until she found a convoy whose destination had been erased from every official chart. She braided the evacuees' white cord into her hair and raised her lance where the next wagon could see it. Her red officer panels and gold fittings are repaired courier equipment; her black-white wings turn flame into a visible guide. Orange fire gathers along the spearhead and breaks into bright gold-white relay strokes. Her Infernic Wrath is directed at the ease with which people become inconvenient numbers. Created by Let, she searches for his still-scattered soul without claiming that a wing or a flame is divine authority. Her trial asks a squad to build momentum together, then leave enough strength to carry the slowest member.

**Vow:** The signal belongs to everyone who still needs the road.

### Appearance authority

single silver lance head with black shaft, gold-brass braid-clasp rings and red officer-panel relief, alternating black-white feather vanes; orange-red flame and gold-white relay strokes, no physical swallowtail flag.

**Palette:** black-white feather panels and white braided hair, red officer cloth, silver lance steel and gold-brass clasps; orange-red flame with gold-white signal strokes. Hair/weapon differences in the supplied stages below are retained, not silently repainted.

| Form | Original root filename | New display name | Supplied appearance / review notes |
|---|---|---|---|
| Common | `Last-Beacon Watch, Vespera.png` | Ashroad Courier, Seravelle | White braided hair, warm tan skin and silver eyes; modest silver-black armor and red shoulder cloth. Single lance with small orange-white flame at its tip. No physical banner is visible. |
| Uncommon | `Whitefire Messenger, Vespera.png` | The Braided Route, Seravelle | High white ponytail continues into a long braid, black officer coat with gold piping and red panels; dark-shaft silver lance. Preserve source hairstyle, not Moon Vespera's tighter single braid. |
| Rare | `Standard of the Night Road, Vespera.png` | Signal Above the Convoy, Seravelle | White hair and long braids, silver-black leg armor and red cloth; white wing plume and red-orange flame-like lower tails behind a double-ended lance. |
| Epic | `Marshal of Unextinguished Signals, Vespera.png` | Marshal of the Open Road, Seravelle | Large white-black wings, curled white hair and long side braid, gold-brass clasps and small red hip panels; elevated silver lance and orange flame under the wings. |
| Legendary | `Procession Beyond the Walls, Vespera.png` | A Standard Without a Throne, Seravelle | White hair under a pointed gold crown, red officer panel, broad black-white feather wings and orange-yellow lance flame. The visible abstract white cross-like insignia remains source detail, not generated lettering. |
| Omnic | `None Left in the Dark, Vespera.png` | The Last Wagon Sees the Dawn, Seravelle | Long flowing white hair with twin braids, ornate silver-black dress armor, red panel accents and gold fittings; huge dark wings and bright golden lightning-like flame along the spear. Not a purple lunar relay. |

### Base stats

| Health | Defense | Direct Attack | Critical Rate | Gauge capacity | Critical multiplier | Elemental Damage |
|---:|---:|---:|---:|---:|---:|---:|
| 235 | 13 | 34 | 14% | 100 | 150% | 0 |

### Passive: Convoy Cadence

When any living squad member's Normal Attack deals direct damage, gain 1 [Cadence], up to 3. Once per round while Seravelle is alive.

### Normal Attack

Deal 100% of Direct Attack to one enemy. Gain 20 Gauge. Shared Defense, critical and action rules apply.

### Skill 1: Send the Ember Ahead

**25 Gauge**

Deal 245% of Seravelle's Direct Attack to one enemy. Apply Burn for 2 enemy phases, dealing 12% of her Direct Attack per phase, scaled by her Skill Power.

### Skill 2: Move as One

**40 Gauge**

Spend all [Cadence]. Grant every living squad member +30% Direct Attack for 2 turns, plus 10% per [Cadence] spent. This buff is not scaled by Skill Power.

### Last Flare: The Road Belongs to Everyone

**100 Gauge | Recover next player turn**

Deal 620% of Seravelle's Direct Attack to all enemies. Grant each other living squad member 20% maximum Gauge and +30 percentage points Skill Power for 2 turns.

### Master: Ashroad Cadence Transmission

**+50% Health | +35 percentage points Skill Power**

Increase maximum [Cadence] to 4. Increase Move as One's base Direct Attack bonus from 30% to 40%.

**Art direction:** a magnificent silver lance-shaped transmission, four gold-brass braid-ring flywheels, red officer-enamel shutters and orange-red flame channels through black-white feather vanes.

### Master: Convoy-Flame Distribution Crown

**+45% Direct Attack | +30 percentage points Skill Power**

When an allied native Burn tick damages an enemy, restore 5% maximum Gauge to each other living squad member. Once per enemy phase while Seravelle is alive; Burn detonations and Conduit damage do not trigger it.

**Art direction:** a colossal gold-brass flame distributor with three silver output pistons, red enamel relay petals, orange-white plasma channels and alternating black-white feather fins.

### Master: Braided-Signal Continuance Engine

**+60% Health | +40% Defense**

After The Road Belongs to Everyone, grant each living squad member a Shield equal to 22% maximum Health, scaled by Seravelle's Skill Power.

**Art direction:** an immense silver continuity engine, paired gold braid-ring axles, white-black feather shutter plates and red command-latch relief; orange-red flame channels shelter three white output shields.

### Strengths, costs and proposed trial

**Strengths:** A funded squad offensive buffer with explicit Burn pressure and a Last Flare that helps other squad members reach their next abilities. Not a monochrome clone of Vespera.

**Limits:** Cadence builds only once per round and cannot grow from a triggered attack. No self-Gauge ultimate refund, no revival, and no extra turns. Buffs refresh rather than stack from repeated casts.

**Pilot rotation:** Let a Normal Attack build Cadence each round; choose Skill 1 for Burn setup or save Cadence for Skill 2. Use the Last Flare to fund allies before Seravelle's real recovery.

**War activity:** March of the Ember Convoy. Header and arena borrow the actual equipment/material motifs above, not the current Moon event scenery. Trial name differs from identity and Omnic title.

## Velmira — proposed six-star Chaotic Attacker

**Identity:** The cut that opens a way without erasing what matters.

**Origin:** The severance ateliers of Thornless Court.

**Lore:** Velmira cut ceremonial bindings in an atelier whose rulers praised every beautiful knot and never asked who could untie it. When the court sealed its doors, she turned the atelier's paired crescent blades against the locking seams. Her white pleats preserve the craft she loved; dark feather fans and violet tips remember what she refused to become. Amber-gold fracture lines mark a clean cut, not an executioner's tally. Chaotic Death and Destruction give her the courage to end an oppressive mechanism without calling destruction itself a cure. A mortal bearer made by Let, she seeks his lost soul through abandoned courts. Her trial rewards alternating measured cuts rather than repeating the most violent stroke.

**Vow:** A broken lock should leave the doorway standing.

### Appearance authority

paired silver crescent blades with gold ring grips and dark pivots, white pleated-panel relief over black plate joins, black feather fins with violet-magenta tips and amber-gold severance seams; not one connected shear tool.

**Palette:** black armor and dark feather fans, layered white pleats, silver crescent blades, gold ring fittings; vivid violet-magenta edge ribbons and amber-gold fracture seams. Hair/weapon differences in the supplied stages below are retained, not silently repainted.

| Form | Original root filename | New display name | Supplied appearance / review notes |
|---|---|---|---|
| Common | `Memorial Restorer, Ilyss.png` | Atelier Defector, Velmira | Dark side-swept hair, pale skin and gray eyes, white tunic pleats over black armor; one held crescent blade and a small black-purple wing/tail shape. Do not claim a visible paired grip in this base image. |
| Uncommon | `Tender of the Broken Link, Ilyss.png` | A Knot Unfastened, Velmira | Blunt dark bob, white pleated skirt and black armor, violet cuff/fringe details; two independent inward crescent blades, each with a ring grip. |
| Rare | `Crescent Unbinder, Ilyss.png` | The Measured Cut, Velmira | Long swept dark hair, silver-black armor and white panel skirt; two dark wing fans and two independent crescent/ring-grip blades. Small orange spark at one blade is supplied. |
| Epic | `Mercy Between the Severed Threads, Ilyss.png` | Keeper of the Open Threshold, Velmira | Dark hair under a silver crown, white plated dress panels and huge black feather-blade wings; gold ring fittings and independent weapon hilts. Visible face and wing-tip clipping need intake review. |
| Legendary | `Release Without Oblivion, Ilyss.png` | An Ending Chosen Carefully, Velmira | Dark blunt bob, white blade-petal skirt, black armor and dense black wings with green-yellow spark details. Preserve supplied detail during key removal; do not globally erase green pixels from the subject. |
| Omnic | `What Harm Cannot Hold, Ilyss.png` | What Remains Beyond the Cut, Velmira | Long curled dark hair, layered white gown, black-silver regalia and black wings edged red/violet; gold ring-grip blades with golden fracture energy. Face/window and full feather tips need edge review. |

### Base stats

| Health | Defense | Direct Attack | Critical Rate | Gauge capacity | Critical multiplier | Elemental Damage |
|---:|---:|---:|---:|---:|---:|---:|
| 218 | 11 | 45 | 23% | 100 | 165% | 0 |

### Passive: Alternating Edge

Gain 1 [Crosscut], up to 3, when an ordinary Skill differs from Velmira's previous ordinary Skill. The first Skill establishes the sequence without granting a stack. Normal Attacks and Last Flare do not change the previous-Skill record.

### Normal Attack

Deal 100% of Direct Attack to one enemy. Gain 20 Gauge. Shared Defense, critical and action rules apply.

### Skill 1: Open the Seam

**25 Gauge**

Deal 280% of Velmira's Direct Attack to one enemy. Apply Weaken for 2 enemy phases, reducing that enemy's direct damage by 25%.

### Skill 2: Turn the Other Edge

**40 Gauge**

Deal 205% of Velmira's Direct Attack to all enemies. Ignore 20% of their Defense while holding at least 2 [Crosscut]; this Skill does not spend [Crosscut].

### Last Flare: Leave the Doorway Standing

**100 Gauge | Recover next player turn**

Spend all [Crosscut]. Deal 1,050% of Velmira's Direct Attack to one enemy, plus 90% per [Crosscut] spent. Ignore 30% of the target's Defense.

### Master: Twin-Edge Sequence Orrery

**+60% Direct Attack | +30 percentage points Skill Power**

Increase maximum [Crosscut] to 4. The first ordinary Skill of each encounter grants 1 [Crosscut] after resolving.

**Art direction:** an immense twin-crescent sequence orrery, four violet-magenta phase rotors, independent silver blade rails and gold ring axles inside black feather fins and white pleated shutters.

### Master: Goldseam Precision Fracturer

**+45% Direct Attack | +25 percentage points Critical Rate**

When Open the Seam targets a Weakened enemy, deal 35% more direct damage. Increase Turn the Other Edge's Defense ignore from 20% to 35% while its Crosscut condition is met.

**Art direction:** a colossal gold-seam precision engine, paired silver crescent cutter rails, violet-magenta pressure channels and amber fracture chambers with black-white pleat relief.

### Master: Open-Threshold Return Drive

**+50% Health | +35% Direct Attack | +20 percentage points Skill Power**

When Leave the Doorway Standing spends at least 3 [Crosscut], restore 25% of Velmira's maximum Gauge after its cost and heal her for 18% maximum Health. Recovery still applies.

**Art direction:** a vast open crescent return drive, gold ring-grip flywheels and silver return pistons around violet-magenta channels, amber seam lights and black feather blades with white pleated inlays.

### Strengths, costs and proposed trial

**Strengths:** Alternating-skill setup, sustained AoE with earned pierce, and a clear single-target finisher. Substantial bonuses rather than cosmetic single-digit buffs.

**Limits:** Crosscut requires a real alternation, starts empty and is spent by Last Flare. No extra action, universal execute, revive or guaranteed critical. One Master at a time prevents combining every payoff.

**Pilot rotation:** Skill 1 -> Skill 2 -> Skill 1 -> Skill 2 to reach 3 Crosscut; use Last Flare only with real Gauge and accept the recovery turn.

**War activity:** Dance of the Unfastened Court. Header and arena borrow the actual equipment/material motifs above, not the current Moon event scenery. Trial name differs from identity and Omnic title.

## Exact mechanic resolutions for future implementation

- Neralis: Current granted by a native heal is at most once across all targets of that action, after the action's spend; shared role/Conduit healing and overheal do not grant it. For a multi-target native heal, the Gauge-return Master checks each target's pre-heal Health and actual restored amount independently; its once-per-round guards survive Settings.
- Varkhel: incoming Tension requires effective direct Health damage or actual Shield absorption; Burn, reflected/redirected/Conduit packets do not grant it. Normal grants once per action. Shield/Defense refresh and taunt use the existing clock, not an extra enemy phase.
- Seravelle: the first effective manual Normal in a round grants one Cadence, even if Seravelle herself used it. Triggered attacks and repeated targets cannot grant another. Her offensive buff is a fixed stat bonus, not implicit Skill Power scaling. The Burn Master excludes detonations and generated damage; Gauge is not restored to her by that Master or her Last Flare. Her ultimate Skill Power buff never strengthens its own attack.
- Velmira: determine whether the chosen Skill alternates, resolve that Skill's damage using its pre-action Crosscut amount, then add its earned stack. Skill2's pierce condition therefore cannot be met retroactively by the new stack. Last Flare snapshots/spends its counter before damage, keeps the previous ordinary Skill record, then applies its funded Master recovery once. The first-Skill Master grants only once per encounter.
- Master Gauge/heal after-effects execute once after the actual action cost; no cost bypass, extra action, new roll or equipment-scale amplification of fixed native counters.

## Required validation before playable integration

1. Review all24 source mappings and acceptance of their supplied hair/weapon differences; inspect source-clipped tips rather than claiming padding repairs them.
2. Review names/lore/roles/kits and the44 new prompts. Delivered portrait quality is not evidence that unseen icons/Masters/scenes exist.
3. Add exact-boundary native/Master tests: empty/full counter, effective/ineffective triggers, multi-target once guards, dead owner, refresh, Settings and new encounters.
4. Benchmark paper damage, healing, Shield creation and survival separately with explicit ownership/gear; then actual pressured trials at relevant gates, no Calamitic equipment.
5. Wire every live surface/authority/save validation only after explicit implementation approval, add no migration grants, preserve existing progression and atomic receipts.
6. Reviewed art intake, full tests/build and matching hosted authority/client verification are required for an actual release. No release is authorized in this pass.

## Total images needed

**44 new associated images. 24 delivered portraits reused. 68 total package images.**
