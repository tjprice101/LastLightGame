# Character combat refresh: audit and proposed direction

## Complete Phase A review package (2026-11-11)

**Proposal only; no gameplay, ownership, enemy, cost, reward, save or schedule
changes.** This section supersedes the older draft hooks below. Phase A covers
all 38 authored bearers, including the six inactive Sunshade identities. Phase B
still requires the owner's kit and mechanic approvals. It must change the actual
game, not introduce another demo. The shared information UI is already published;
these proposed effects are not misrepresented as its current tooltips.

The original request's separate 25-ability foundation was not present in the
supplied attachment. This is an original Last Light proposal based on the actual
resolver, authored identities and the owner's concise-copy direction, not a
claimed reconstruction or copy of those examples.

### Evidence and current-kit audit

Read the current [kit definitions](../../src/content/combat-kits.ts),
[resolver](../../src/game/combat-engine.ts), [charge model](../../src/game/combat-gauge.ts),
[Conduit primitives](../../src/content/conduit-effects.ts), release visibility,
roster, personal Master definitions and shared description functions. Reviewed
contact sheets of all 192 installed portrait forms; Sunshade's 36 portrait forms
are genuinely pending, so their weapon, silhouette and lore evidence comes from
the approved identity documents, not invented pixels. The sheets show late-form
equipment drift in some installed artwork; mechanics retain authored equipment
identities rather than silently redesigning characters around an export.

The following snapshot is generated from current source, not historical native
Skill 1/2/Last Flare values. **H/A/D/R** means base Health/Attack/Defense/Recovery;
**C** is base personal Flare cost. **EP** is enemy phases; **RS** is round starts.
Percentages in the table are unenhanced coefficients. Damage is before Defense;
Burn uses caster Attack, healing/Renewal caster Recovery, Shields caster Defense
and recipient maximum Health. Every Flare's ally effects apply to all living
allies, regardless of its enemy target field.

| Bearer / ID | Live base H/A/D/R; C | Leader | Passive | Glowing; Lustrous; Eternal |
|---|---|---|---|---|
| Infernis / `ember` | 240/60/16/28; 30 | Hearthbound Oath: attack +15% | Banked Cinder: Normal HP damage against an enemy carrying Infernis’s Burn adds one 10% Attack periodic packet. No bonus motes from that packet. | **G Cinderwake:** 140% A all enemies; Burn 12% A/2 EP<br>**L Cinderwake Ascendant:** 200% A all enemies; Burn 16% A/2 EP<br>**E Cinderwake Everlasting:** 300% A all enemies; Burn 20% A/3 EP |
| Tizu / `tide` | 300/44/22/34; 25 | Harbor Covenant: defense +20% | Tideglass Return: A direct enemy hit fully absorbed by only Tizu’s Flare Shields grants Tizu 8 personal charge, once per enemy phase while he lives. | **G Tideglass Shelter:** allied Shield 90% D + 5% recipient H<br>**L Tideglass Dominion:** allied Shield 130% D + 7% recipient H; allied DR 15%/1 EP<br>**E Tideglass Eternity:** allied Shield 180% D + 10% recipient H; allied DR 25%/2 EP |
| Flora / `sprout` | 220/46/14/65; 20 | Garden Covenant: recovery +15% | Dawnseed: Normal HP damage plants a 15% Recovery Seed on the most wounded living ally; it heals at the next round start. | **G Dawnseed Renewal:** allied heal 80% R; allied Renewal 15% R/2 RS<br>**L Dawnseed Flourishing:** allied heal 110% R; allied Renewal 20% R/2 RS<br>**E Dawnseed Perennial:** allied heal 180% R; allied Renewal 30% R/3 RS |
| Rosetta / `rosetta` | 245/58/15/38; 32 | Quarry Oath: attack +12% | Gilded Sightline: Normal HP damage exposes that enemy to 8% more direct damage for one enemy phase. | **G Rose Meridian:** 165% A one enemy; Exposure 18%/2 EP<br>**L Rose Meridian Ascendant:** 222.75% A one enemy; Exposure 22.5%/2 EP<br>**E Rose Meridian Everlasting:** 297% A one enemy; Exposure 27.9%/2 EP |
| Thornia / `thornia` | 315/45/24/32; 34 | Garden Gate: defense +18% | Gatekeeper’s Offering: Defense grants the most wounded living ally a Shield equal to 25% of Thornia’s Defense. | **G Thorn Aegis:** allied Shield 80% D + 6% recipient H; allied DR 12%/1 EP<br>**L Thorn Aegis Ascendant:** allied Shield 100% D + 7.5% recipient H; allied DR 15%/1 EP<br>**E Thorn Aegis Everlasting:** allied Shield 124% D + 9.3% recipient H; allied DR 18.6%/1 EP |
| Crinso / `crinso` | 235/64/14/30; 34 | Twin-Rose Accord: attack +10% | Twin-Edge Temper: Normal HP damage against a Burning enemy adds one 18% Attack generated packet, without bonus motes. | **G Blossoming Edge:** 205% A one enemy; Burn 8% A/2 EP<br>**L Blossoming Edge Ascendant:** 276.75% A one enemy; Burn 10% A/2 EP<br>**E Blossoming Edge Everlasting:** 369% A one enemy; Burn 12.4% A/2 EP |
| Maerion / `maerion` | 285/40/20/70; 34 | Open Ferry: recovery +14% | Ferry Fare Returned: A Flare that restores actual allied HP returns 4 personal charge once per cast; full-HP healing does not qualify. | **G Unreturned Voyage:** allied heal 55% R; allied Renewal 10% R/1 RS<br>**L Unreturned Voyage Ascendant:** allied heal 68.75% R; allied Renewal 12.5% R/1 RS<br>**E Unreturned Voyage Everlasting:** allied heal 85.25% R; allied Renewal 15.5% R/1 RS |
| Caevren / `caevren` | 325/40/28/28; 34 | Bridgeweight Vow: defense +20% | Counterweight Repose: After a direct hit absorbs any Shield on Caevren, he heals for 20% Recovery, once per round while alive. | **G Meridian Counterweight:** allied Shield 125% D + 3% recipient H; allied DR 10%/1 EP<br>**L Meridian Counterweight Ascendant:** allied Shield 156.25% D + 3.75% recipient H; allied DR 12.5%/1 EP<br>**E Meridian Counterweight Everlasting:** allied Shield 193.75% D + 4.65% recipient H; allied DR 15.5%/1 EP |
| Vespera / `vespera` | 250/48/18/52; 34 | Last Beacon: recovery +12% | Beacon Afterimage: Normal HP damage applies a 6% Attack Burn for one enemy phase to the surviving target. | **G Beacon Signal:** 90% A all enemies; Burn 10% A/2 EP; allied Attack +8%/1 rounds<br>**L Beacon Signal Ascendant:** 121.5% A all enemies; Burn 12.5% A/2 EP; allied Attack +10%/1 rounds<br>**E Beacon Signal Everlasting:** 162% A all enemies; Burn 15.5% A/2 EP; allied Attack +12.4%/1 rounds |
| Ilyss / `ilyss` | 265/42/19/68; 34 | Living Thread: recovery +14% | Unknotted Passage: Defense removes the strongest Weaken from one living ally, selecting the greatest debuff first. | **G Severance Mercy:** allied DR 10%/1 EP; allied heal 38% R<br>**L Severance Mercy Ascendant:** allied DR 12.5%/1 EP; allied heal 47.5% R<br>**E Severance Mercy Everlasting:** allied DR 15.5%/1 EP; allied heal 58.9% R |
| Asteriel / `asteriel` | 245/42/17/66; 34 | Shared Orbit: recovery +12% | Borrowed Moonflower: Normal HP damage plants a 10% Recovery Seed on the most wounded living ally, healing at the next two round starts. | **G Moonflower Promise:** allied heal 22% R; allied Renewal 22% R/2 RS<br>**L Moonflower Promise Ascendant:** allied heal 27.5% R; allied Renewal 27.5% R/2 RS<br>**E Moonflower Promise Everlasting:** allied heal 34.1% R; allied Renewal 34.1% R/2 RS |
| Serapha / `serapha` | 290/41/23/62; 34 | Ceasefire Interval: defense +12% | Unstruck Sanctuary: After losing HP to a direct enemy hit, Serapha creates a self-Shield equal to 2.5% maximum HP, once per round. | **G Sanctuary Interval:** allied Shield 75% D + 5% recipient H; allied DR 20%/1 EP<br>**L Sanctuary Interval Ascendant:** allied Shield 93.75% D + 6.25% recipient H; allied DR 25%/1 EP<br>**E Sanctuary Interval Everlasting:** allied Shield 116.25% D + 7.75% recipient H; allied DR 31%/1 EP |
| Rhaziel / `rhaziel` | Inactive; no live four-stat kit or C | No live Leader | No live Passive | No live tiers; authored legacy kit in Moon/Sunshade specification is not executable Radiant content |
| Oryn / `oryn` | Inactive; no live four-stat kit or C | No live Leader | No live Passive | No live tiers; authored legacy kit in Moon/Sunshade specification is not executable Radiant content |
| Thessara / `thessara` | Inactive; no live four-stat kit or C | No live Leader | No live Passive | No live tiers; authored legacy kit in Moon/Sunshade specification is not executable Radiant content |
| Elaris / `elaris` | Inactive; no live four-stat kit or C | No live Leader | No live Passive | No live tiers; authored legacy kit in Moon/Sunshade specification is not executable Radiant content |
| Veyr / `veyr` | Inactive; no live four-stat kit or C | No live Leader | No live Passive | No live tiers; authored legacy kit in Moon/Sunshade specification is not executable Radiant content |
| Aureth / `aureth` | Inactive; no live four-stat kit or C | No live Leader | No live Passive | No live tiers; authored legacy kit in Moon/Sunshade specification is not executable Radiant content |
| Atmoso / `atmoso` | 245/56/16/35; 30 | Open-Sky Route: attack +12% | Passing Tailwind: Normal HP damage grants the next living unacted squad member 10% Attack for the rest of this round. | **G Sky Without End:** 130% A all enemies; Weaken 10%/1 EP<br>**L Sky Without End Ascendant:** 175.5% A all enemies; Weaken 12.5%/1 EP<br>**E Sky Without End Everlasting:** 234% A all enemies; Weaken 15.5%/1 EP |
| Aurora / `aurora` | 265/43/19/58; 34 | Merciful Verdict: recovery +12% | Merciful Lens: Casting a Flare removes each living ally’s strongest Weaken, once per cast. | **G Final Dawn:** 65% A all enemies; allied DR 12%/1 EP; Weaken 20%/2 EP<br>**L Final Dawn Ascendant:** 87.75% A all enemies; allied DR 15%/1 EP; Weaken 25%/2 EP<br>**E Final Dawn Everlasting:** 117% A all enemies; allied DR 18.6%/1 EP; Weaken 31%/2 EP |
| Bliss / `bliss` | 235/55/15/48; 34 | Quietstorm Measure: attack +10% | Feathered Encore: After another squad member has acted, Normal HP damage heals the most wounded living ally for 18% of Bliss’s Recovery. | **G Thousandfeather:** allied heal 18% R; allied Attack +12%/1 rounds<br>**L Thousandfeather Ascendant:** allied heal 22.5% R; allied Attack +15%/1 rounds<br>**E Thousandfeather Everlasting:** allied heal 27.9% R; allied Attack +18.6%/1 rounds |
| Bruno / `bruno` | 320/43/25/27; 30 | Worldwall Stand: defense +18% | Remembered Impact: After losing HP to a direct enemy hit, Bruno creates a 30% Defense self-Shield, once per round. | **G Worldwall Mantle:** allied Shield 110% D + 4% recipient H<br>**L Worldwall Mantle Ascendant:** allied Shield 137.5% D + 5% recipient H<br>**E Worldwall Mantle Everlasting:** allied Shield 170.5% D + 6.2% recipient H |
| Disciple / `disciple` | 250/45/17/54; 34 | Unbound Concord: recovery +10% | Open Mindcrown: Defense grants the next living unacted squad member 12% Attack for the rest of this round. | **G Mindcrown Resolve:** allied Attack +22%/1 rounds<br>**L Mindcrown Resolve Ascendant:** allied Attack +27.5%/1 rounds<br>**E Mindcrown Resolve Everlasting:** allied Attack +34.1%/1 rounds |
| Elise / `elise` | 230/62/14/34; 30 | Crosswind Opening: attack +13% | Crosswheel Pursuit: Normal HP damage against an exposed enemy adds one 20% Attack generated packet, without bonus motes. | **G Thunderwheel Recall:** 220% A one enemy; Weaken 8%/1 EP<br>**L Thunderwheel Recall Ascendant:** 297% A one enemy; Weaken 10%/1 EP<br>**E Thunderwheel Recall Everlasting:** 396% A one enemy; Weaken 12.4%/1 EP |
| Razor / `razor` | 310/52/24/25; 34 | Midnight Bastion: defense +15% | Nightguard Verdict: Defense Weakens the living enemy with the highest Attack by 12% for one enemy phase. | **G Unbroken Midnight:** 165% A one enemy; allied Shield 55% D + 3% recipient H<br>**L Unbroken Midnight Ascendant:** 222.75% A one enemy; allied Shield 68.75% D + 3.75% recipient H<br>**E Unbroken Midnight Everlasting:** 297% A one enemy; allied Shield 85.25% D + 4.65% recipient H |
| Nerithe / `nerithe` | 245/59/15/38; 34 | Uncharted Meridian: attack +12% | Charted Current: Each Normal Attack grants 5 additional guaranteed personal charge. Generated damage does not qualify. | **G Ocean Beyond the Map:** 180% A one enemy; Weaken 18%/2 EP<br>**L Ocean Beyond the Map Ascendant:** 243% A one enemy; Weaken 22.5%/2 EP<br>**E Ocean Beyond the Map Everlasting:** 324% A one enemy; Weaken 27.9%/2 EP |
| Orvella / `orvella` | 320/42/27/36; 34 | Load-Bearing Will: defense +14% | Foundation Recast: Defense creates a self-Shield equal to 40% of Orvella’s Defense. | **G Faultline Foundation:** allied Shield 115% D + 4% recipient H<br>**L Faultline Foundation Ascendant:** allied Shield 143.75% D + 5% recipient H<br>**E Faultline Foundation Everlasting:** allied Shield 178.25% D + 6.2% recipient H |
| Vaelor / `vaelor` | 235/61/14/34; 34 | Standing Thunder: attack +14% | Resonant Opening: Normal HP damage against an exposed enemy grants 3 personal charge. | **G Final Chord:** 135% A all enemies; Weaken 12%/1 EP<br>**L Final Chord Ascendant:** 182.25% A all enemies; Weaken 15%/1 EP<br>**E Final Chord Everlasting:** 243% A all enemies; Weaken 18.6%/1 EP |
| Caldrex / `caldrex` | 330/46/27/28; 34 | Banked Heat: defense +12% | Kiln Reprisal: An enemy directly absorbing a Caldrex-owned Shield receives an 8% Attack Burn for one enemy phase, once per round while Caldrex lives. | **G Closed Kiln:** 70% A all enemies; Burn 6% A/2 EP; allied Shield 100% D + 5% recipient H<br>**L Closed Kiln Ascendant:** 94.5% A all enemies; Burn 7.5% A/2 EP; allied Shield 125% D + 6.25% recipient H<br>**E Closed Kiln Everlasting:** 126% A all enemies; Burn 9.3% A/2 EP; allied Shield 155% D + 7.75% recipient H |
| Solenne / `solenne` | 315/42/28/39; 34 | Held Stillness: defense +16% | Vesper Stillness: Defense grants Solenne 12% direct damage reduction for the next enemy phase, separate from guarding. | **G Last Reverberation:** allied Shield 80% D + 4% recipient H; allied DR 16%/2 EP<br>**L Last Reverberation Ascendant:** allied Shield 100% D + 5% recipient H; allied DR 20%/2 EP<br>**E Last Reverberation Everlasting:** allied Shield 124% D + 6.2% recipient H; allied DR 24.8%/2 EP |
| Myrthen / `myrthen` | 245/60/15/40; 34 | Turning Season: attack +12% | Season’s Return: Normal HP damage against a Burning enemy heals Myrthen for 15% Recovery. | **G All That Ripens:** 165% A all enemies; Burn 8% A/2 EP<br>**L All That Ripens Ascendant:** 222.75% A all enemies; Burn 10% A/2 EP<br>**E All That Ripens Everlasting:** 297% A all enemies; Burn 12.4% A/2 EP |
| Neralis / `neralis` | 285/43/20/72; 34 | Returning Current: recovery +14% | Carried Ashore: A Flare that restores actual allied HP grants the most wounded living ally a 20% Recovery Shield once per cast. | **G No Crossing Left Empty:** allied heal 42% R; allied Renewal 12% R/1 RS<br>**L No Crossing Left Empty Ascendant:** allied heal 52.5% R; allied Renewal 15% R/1 RS<br>**E No Crossing Left Empty Everlasting:** allied heal 65.1% R; allied Renewal 18.6% R/1 RS |
| Varkhel / `varkhel` | 330/45/27/31; 34 | Tension Held: defense +14% | Tension Passed: Normal HP damage grants the next living unacted squad member a Shield equal to 30% of Varkhel’s Defense. | **G Bridge Holds:** allied Shield 95% D + 6% recipient H; allied Attack +8%/1 rounds<br>**L Bridge Holds Ascendant:** allied Shield 118.75% D + 7.5% recipient H; allied Attack +10%/1 rounds<br>**E Bridge Holds Everlasting:** allied Shield 147.25% D + 9.3% recipient H; allied Attack +12.4%/1 rounds |
| Seravelle / `seravelle` | 270/52/20/47; 34 | Convoy Cadence: attack +10% | Convoy Intercession: Defense grants the most wounded living ally a Shield equal to 20% of Seravelle’s Recovery. | **G Road Belongs to Everyone:** allied heal 8% R; allied Attack +18%/1 rounds<br>**L Road Belongs to Everyone Ascendant:** allied heal 10% R; allied Attack +22.5%/1 rounds<br>**E Road Belongs to Everyone Everlasting:** allied heal 12.4% R; allied Attack +27.9%/1 rounds |
| Velmira / `velmira` | 240/63/15/34; 34 | Alternating Edge: attack +12% | Doorway Fault: Normal HP damage against a Weakened enemy exposes it to 10% more direct damage for one enemy phase. | **G Leave the Doorway Standing:** 205% A one enemy; Weaken 14%/2 EP<br>**L Leave the Doorway Standing Ascendant:** 276.75% A one enemy; Weaken 17.5%/2 EP<br>**E Leave the Doorway Standing Everlasting:** 369% A one enemy; Weaken 21.7%/2 EP |
| Ozriel / `ozriel` | 360/40/31/40; 34 | Refusal: defense +20% | Refusal Rekindled: After direct enemy HP damage leaves Ozriel below half HP, he creates a 4% maximum HP self-Shield, once per round. No revival. | **G Unbroken Refusal:** allied Shield 110% D + 6% recipient H; allied DR 12%/1 EP<br>**L Unbroken Refusal Ascendant:** allied Shield 137.5% D + 7.5% recipient H; allied DR 15%/1 EP<br>**E Unbroken Refusal Everlasting:** allied Shield 170.5% D + 9.3% recipient H; allied DR 18.6%/1 EP |
| Ilvaris / `ilvaris` | 320/45/24/70; 34 | Hymn of Broken Glass: recovery +12% | Afterglass Hymn: Normal HP damage grants the most wounded living ally 12% Recovery Renewal at the next round start. | **G Fate-seared Hymn:** allied heal 38% R; allied Renewal 12% R/2 RS<br>**L Fate-seared Hymn Ascendant:** allied heal 47.5% R; allied Renewal 15% R/2 RS<br>**E Fate-seared Hymn Everlasting:** allied heal 58.9% R; allied Renewal 18.6% R/2 RS |
| Kaelith / `kaelith` | 250/70/17/32; 34 | Fractalized Incision: attack +14% | First Fractal Cut: Normal HP damage against an enemy that began the hit above half HP adds one 16% Attack generated packet, without bonus motes. | **G Glass Meridian:** 235% A one enemy; Weaken 15%/1 EP<br>**L Glass Meridian Ascendant:** 317.25% A one enemy; Weaken 18.75%/1 EP<br>**E Glass Meridian Everlasting:** 423% A one enemy; Weaken 23.25%/1 EP |

**Current personal Masters:** slots below are the existing IDs `master-<bearer ID>-1/2/3`, not newly invented items. Equinox without a Master; current attunement packages are defined below. Every row states the actual live rule, including starter overrides.

| Bearer | Master 1 | Master 2 | Master 3 |
|---|---|---|---|
| Infernis | **Helios Pyre Cathedral**: corona; Cinderwake Burn lasts one additional enemy phase. | **Cinderstar Genesis Engine**: corona; Cinderwake direct damage increases by 15%. | **Unbroken Sunforge Throne**: solstice; Casting Cinderwake grants Infernis a Shield equal to 8% of maximum HP. |
| Tizu | **Abyssal Shelter Observatory**: aegis; Tideglass Shields increase by 15%. | **Ocean Memory Worldpump**: solstice; Tideglass adds 8% of each recipient’s maximum HP to its Shield. | **Undertow Sovereign Harpoon**: corona; Tideglass also strikes the selected enemy for 90% Attack. |
| Flora | **Worldseed Mercy Foundry**: prism; Dawnseed immediate healing increases by 15%. | **Briar Constellation Loom**: corona; Dawnseed also strikes the selected enemy for 75% Attack. | **Evergreen Continuance Crucible**: solstice; Dawnseed Renewal lasts one additional round. |
| Rosetta | **Rose Beyond the Sun Orrery**: corona; Strengthens Gilded Sightline by 15% while its bearer is alive. | **Virtuous Planet Rosegarden**: corona; Strengthens Rose Meridian by 15%. | **Golden Thorn Judgment Loom**: prism; Strengthens Quarry Oath by 5 percentage points while this bearer is first and alive. |
| Thornia | **Forbidden Garden Worldlock**: aegis; Strengthens Gatekeeper’s Offering by 15% while its bearer is alive. | **Thousand-Rose Planetary Aegis**: solstice; Strengthens Thorn Aegis by 15%. | **Shadow Rose Sovereign Foundry**: corona; Strengthens Garden Gate by 5 percentage points while this bearer is first and alive. |
| Crinso | **Twin-Rose Singularity Drive**: corona; Strengthens Twin-Edge Temper by 15% while its bearer is alive. | **Duality Planet Flamewheel**: solstice; Strengthens Blossoming Edge by 15%. | **Crimson Beauty Pyre Requiem**: prism; Strengthens Twin-Rose Accord by 5 percentage points while this bearer is first and alive. |
| Maerion | **Unreturned Voyage Worldpump**: prism; Strengthens Ferry Fare Returned by 15% while its bearer is alive. | **Crescent Rib Mercy Foundry**: solstice; Strengthens Unreturned Voyage by 15%. | **Ferrywake Remembrance Dynamo**: aegis; Strengthens Open Ferry by 5 percentage points while this bearer is first and alive. |
| Caevren | **Meridian Counterweight Atlas**: aegis; Strengthens Counterweight Repose by 15% while its bearer is alive. | **Observatory Loadshare Regulator**: solstice; Strengthens Meridian Counterweight by 15%. | **Falling-Star Recoil Turbine**: prism; Strengthens Bridgeweight Vow by 5 percentage points while this bearer is first and alive. |
| Vespera | **Whitefire Procession Transmitter**: corona; Strengthens Beacon Afterimage by 15% while its bearer is alive. | **Mirror-Pennant Ignition Crown**: prism; Strengthens Beacon Signal by 15%. | **Unextinguished Relay Cathedral**: solstice; Strengthens Last Beacon by 5 percentage points while this bearer is first and alive. |
| Ilyss | **Crescent-Link Severance Loom**: prism; Unknotted Passage also heals each cleansed recipient for 15% of its bearer’s Recovery. | **Unbinding Mercy Worldlock**: solstice; Strengthens Severance Mercy by 15%. | **Broken-Link Continuance Engine**: aegis; Strengthens Living Thread by 5 percentage points while this bearer is first and alive. |
| Asteriel | **Moonflower Seedworld Orrery**: prism; Strengthens Borrowed Moonflower by 15% while its bearer is alive. | **Night-Library Germination Vault**: prism; Strengthens Moonflower Promise by 15%. | **Freely-Given Starseed Distributor**: solstice; Strengthens Shared Orbit by 5 percentage points while this bearer is first and alive. |
| Serapha | **Open-Arc Sanctuary Regulator**: solstice; Strengthens Unstruck Sanctuary by 15% while its bearer is alive. | **Articulated Mercy Fanforge**: aegis; Strengthens Sanctuary Interval by 15%. | **Unstruck Verdict Concordance**: prism; Strengthens Ceasefire Interval by 5 percentage points while this bearer is first and alive. |
| Rhaziel | **Anvil-Needle Restoration Foundry**: inactive native definition only; +60% [Health] ; +35 percentage points [Skill Power]. [Repair] stores 35% of absorbed damage instead of 20%, up to 30% of its holder’s maximum [Health]. | **Borrowed-Dawn Seam Cathedral**: inactive native definition only; +75% [Health] ; +35% [Defense]. When a Shield from Rhaziel’s abilities breaks, grant its holder +25% [Defense] for two player turns, once per ally per enemy phase; refreshes rather than stacks. | **Remembered-Dent Repair Dynamo**: inactive native definition only; +40% [Health] ; +20 percentage points [Skill Efficiency]. When [Repair] restores [Health], grant its holder 8 Elemental Gauge, once per ally per player turn. Ineffective healing grants no Gauge. |
| Oryn | **Unstruck Seal Arbitration Engine**: inactive native definition only; +50% [Health] ; +30 percentage points [Skill Power]. Increase [Accord]’s bonus direct damage against [Terms] from 30% to 50%. | **Open-Threshold Oath Worldlock**: inactive native definition only; +75% [Health] ; +25 percentage points [Skill Power]. After [An Exit in the Agreement], Shield its target for 25% of their maximum [Health]. | **Sunshade Concordance Distributor**: inactive native definition only; +40% [Health] ; +20 percentage points [Skill Efficiency]. After [Accord] strengthens an attack against [Terms], grant its attacker 10 Elemental Gauge, once per player turn. |
| Thessara | **Twin-Vessel Reservoir Worldpump**: inactive native definition only; +60% [Health] ; +25 percentage points [Skill Power]. Increase maximum [Reserve] to 5; [Deliver What Was Promised] heals 12% maximum [Health] per [Reserve] instead of 10%. | **Unomitted Channel Manifold**: inactive native definition only; +75% [Health] ; +35% [Defense]. After [Deliver What Was Promised], Shield its target for 20% of maximum [Health], plus 3% per [Reserve] spent. | **Droughtbreak Delivery Dynamo**: inactive native definition only; +40% [Health] ; +20 percentage points [Skill Efficiency]. Increase [Deliver What Was Promised] Gauge grant from 8 to 10 per [Reserve], and [No Village Omitted] grant from 6 to 8 per [Reserve]. |
| Elaris | **Spear-Grove Breakthrough Crown**: inactive native definition only; +60% [Direct Attack] ; +30 percentage points [Skill Power]. Increase maximum [Branch] to 4. | **Seedpod Pursuit Foundry**: inactive native definition only; +45% [Direct Attack] ; +25 percentage points [Critical Rate]. [Mark the Firebreak] grants 2 [Branch] instead of 1. | **Firebreak Route-Opening Turbine**: inactive native definition only; +40% [Direct Attack] ; +30 percentage points [Skill Power]. After Elaris spends [Branch], give every other living ally [Open Route]: their next damaging Skill or Last Flare ignores 15% [Defense] through the next player turn; refreshes rather than stacks. |
| Veyr | **Precision Faultworld Dismantler**: inactive native definition only; +60% [Direct Attack] ; +30 percentage points [Skill Power]. Increase maximum [Fault] to 4; its total [Defense] reduction cannot exceed 40%. | **Three-Brace Demolition Orrery**: inactive native definition only; +45% [Direct Attack] ; +25 percentage points [Skill Power]. After Veyr spends [Fault] on a surviving marked enemy, place [Aftershock] dealing 100% [Direct Attack] per [Fault] spent after the next enemy phase while Veyr lives. Replaces his existing [Aftershock]. | **Refuge-Sparing Siege Regulator**: inactive native definition only; +40% [Direct Attack] ; +50% [Health]. When Veyr spends [Fault], Shield every living squad member for 5% of their maximum [Health] per [Fault] spent. |
| Aureth | **Keystone Convection Worldshield**: inactive native definition only; +60% [Health] ; +60% [Defense]. Increase maximum [Momentum] to 4; each [Momentum] spent by Last Flare also adds 5% maximum-[Health] Shield. | **Eclipse Canopy Rescue Foundry**: inactive native definition only; +75% [Health] ; +25 percentage points [Skill Power]. Increase [Lead] direct-damage reduction from 20% to 30%. | **Moving-Horizon Corridor Turbine**: inactive native definition only; +50% [Defense] ; +20 percentage points [Skill Efficiency]. When an enemy direct attack damages the [Lead] holder’s [Health] or Shield, grant that ally 8 Elemental Gauge, once per enemy phase. |
| Atmoso | **Sky Without End Turbine**: corona; Strengthens Passing Tailwind by 15% while its bearer is alive. | **Horizon Cyclone Orrery**: prism; Strengthens Sky Without End by 15%. | **Crosswind Imperial Drive**: solstice; Strengthens Open-Sky Route by 5 percentage points while this bearer is first and alive. |
| Aurora | **Final Dawn Tribunal**: prism; Merciful Lens also heals each cleansed recipient for 15% of its bearer’s Recovery. | **Prismseal Astral Judiciary**: solstice; Strengthens Final Dawn by 15%. | **Merciful Eclipse Regulator**: aegis; Strengthens Merciful Verdict by 5 percentage points while this bearer is first and alive. |
| Bliss | **Thousandfeather Zenith Loom**: prism; Strengthens Feathered Encore by 15% while its bearer is alive. | **Stillplume Planetary Ballet**: corona; Strengthens Thousandfeather by 15%. | **Quiet Heaven Fanforge**: solstice; Strengthens Quietstorm Measure by 5 percentage points while this bearer is first and alive. |
| Bruno | **Living Worldwall Atlas**: aegis; Strengthens Remembered Impact by 15% while its bearer is alive. | **Quarry Planet Gravitas**: solstice; Strengthens Worldwall Mantle by 15%. | **Worldforge Hammer Dominion**: corona; Strengthens Worldwall Stand by 5 percentage points while this bearer is first and alive. |
| Disciple | **Unbound Mindcrown Synapse**: prism; Strengthens Open Mindcrown by 15% while its bearer is alive. | **Concord Planet Thoughtforge**: corona; Strengthens Mindcrown Resolve by 15%. | **Sovereign Will Amplifier**: solstice; Strengthens Unbound Concord by 5 percentage points while this bearer is first and alive. |
| Elise | **Infinite Thunderwheel Arsenal**: corona; Strengthens Crosswheel Pursuit by 15% while its bearer is alive. | **Twin Star Planetary Ratchet**: corona; Strengthens Thunderwheel Recall by 15%. | **Storm Empress Execution Clock**: aegis; Strengthens Crosswind Opening by 5 percentage points while this bearer is first and alive. |
| Razor | **Unbroken Midnight Bastion**: aegis; Strengthens Nightguard Verdict by 15% while its bearer is alive. | **Eclipse Planet Watchtower**: corona; Strengthens Unbroken Midnight by 15%. | **Nightglass Counterblade Engine**: solstice; Strengthens Midnight Bastion by 5 percentage points while this bearer is first and alive. |
| Nerithe | **Shoreless Meridian Worldchart**: corona; Strengthens Charted Current by 15% while its bearer is alive. | **Folded Ocean Planetarium**: corona; Strengthens Ocean Beyond the Map by 15%. | **Abyssal Surveyor Crown**: prism; Strengthens Uncharted Meridian by 5 percentage points while this bearer is first and alive. |
| Orvella | **Throne Beneath the World**: aegis; Strengthens Foundation Recast by 15% while its bearer is alive. | **Deep Foundation Planetpress**: solstice; Strengthens Faultline Foundation by 15%. | **Keystone Sovereign Counterweight**: corona; Strengthens Load-Bearing Will by 5 percentage points while this bearer is first and alive. |
| Vaelor | **Final Chord Celestial Resonator**: corona; Strengthens Resonant Opening by 15% while its bearer is alive. | **Thunder Choir Planetary Fugue**: corona; Strengthens Final Chord by 15%. | **Broken Sky Imperial Metronome**: solstice; Strengthens Standing Thunder by 5 percentage points while this bearer is first and alive. |
| Caldrex | **Banked-Sun Pressure Accumulator**: aegis; Strengthens Kiln Reprisal by 15% while its bearer is alive. | **Counterstroke Recoil Foundry**: solstice; Strengthens Closed Kiln by 15%. | **Cinderpulse Triage Converter**: corona; Strengthens Banked Heat by 5 percentage points while this bearer is first and alive. |
| Solenne | **Stillpoint Inertial Governor**: aegis; Strengthens Vesper Stillness by 15% while its bearer is alive. | **Quiet-Arc Shelter Projector**: solstice; Strengthens Last Reverberation by 15%. | **Cadence Differential Drive**: prism; Strengthens Held Stillness by 5 percentage points while this bearer is first and alive. |
| Myrthen | **Seasonwheel Harvest Transmission**: corona; Strengthens Season’s Return by 15% while its bearer is alive. | **Seedtrace Pursuit Distributor**: corona; Strengthens All That Ripens by 15%. | **Reaping-Tide Recovery Dynamo**: prism; Strengthens Turning Season by 5 percentage points while this bearer is first and alive. |
| Neralis | **Amber-Station Return Manifold**: prism; Strengthens Carried Ashore by 15% while its bearer is alive. | **Blackwing Crossing Stabilizer**: solstice; Strengthens No Crossing Left Empty by 15%. | **Weirheart Recollection Dynamo**: aegis; Strengthens Returning Current by 5 percentage points while this bearer is first and alive. |
| Varkhel | **Faultstar Chain Accumulator**: aegis; Strengthens Tension Passed by 15% while its bearer is alive. | **Scarlet-Hinge Load Distributor**: solstice; Strengthens Bridge Holds by 15%. | **Recoil-Star Compression Turbine**: corona; Strengthens Tension Held by 5 percentage points while this bearer is first and alive. |
| Seravelle | **Ashroad Cadence Transmission**: prism; Strengthens Convoy Intercession by 15% while its bearer is alive. | **Convoy-Flame Distribution Crown**: corona; Strengthens Road Belongs to Everyone by 15%. | **Braided-Signal Continuance Engine**: solstice; Strengthens Convoy Cadence by 5 percentage points while this bearer is first and alive. |
| Velmira | **Twin-Edge Sequence Orrery**: corona; Strengthens Doorway Fault by 15% while its bearer is alive. | **Goldseam Precision Fracturer**: corona; Strengthens Leave the Doorway Standing by 15%. | **Open-Threshold Return Drive**: aegis; Strengthens Alternating Edge by 5 percentage points while this bearer is first and alive. |
| Ozriel | **Refusal Sovereign Heartdrive**: solstice; Strengthens Refusal Rekindled by 15% while its bearer is alive. | **Absolution Planetary Suppressor**: aegis; Strengthens Unbroken Refusal by 15%. | **Unfallen Continuum Worldengine**: corona; Strengthens Refusal by 5 percentage points while this bearer is first and alive. |
| Ilvaris | **Unsung Verse Harmonic Supercharger**: prism; Strengthens Afterglass Hymn by 15% while its bearer is alive. | **Hymnwind Imperial Turbine**: solstice; Strengthens Fate-seared Hymn by 15%. | **Severed Prophecy Chronodrive**: corona; Strengthens Hymn of Broken Glass by 5 percentage points while this bearer is first and alive. |
| Kaelith | **Glass Meridian Singularity Harvester**: corona; Strengthens First Fractal Cut by 15% while its bearer is alive. | **Thousand-Fault Rupture Accelerator**: corona; Strengthens Glass Meridian by 15%. | **Denied Fate Eclipse Annihilator**: aegis; Strengthens Fractalized Incision by 5 percentage points while this bearer is first and alive. |

**Resolver exceptions to the numeric Flare table:** Infernis's Eternal first
consumes his own existing Burns for their remaining periodic damage, then hits
and reapplies Burn. Flora's Eternal also removes the strongest Weaken from each
healed ally. Tizu's passive's first encounter Shield is distinct from repeated
Flare Shields. Starter Master follow-up strikes are generated packets, not extra
charge-generating direct hits. Existing passive/Leader/signature Imbues remain
separate saved enhancements. The snapshot is base content, not a claim that every
actual equipped fighter has those numbers.

### Problems found and design response

| Evidence | Actual problem | Proposed correction |
|---|---|---|
| 29 non-starter tier sets use the same damage multipliers 1/1.35/1.8 and support multipliers 1/1.25/1.55 | Three tiers mostly repeat a stronger signature rather than add decisions | All 114 proposed tiers are independently specified; higher tiers add funded utility or a distinct payoff |
| 87 non-starter Masters choose passive +15%, signature +15% or Leader +5 percentage points by slot | Different machine identities collapse into three generic upgrades | All 114 existing IDs receive individually scoped transformations below |
| 32 live Leaders select one stat | Leader choice rarely changes action order or squad construction | Two-part Leaders combine a stat with an explicit bounded combat condition |
| Many passives are one small conditional heal/Shield/charge amount | Identity is mechanically hard to notice | Distinct resource, sequencing, protection or delivery mechanics; no two primary loops match |
| Authoritative flare offers omit Infernis's detonation and Flora's cleanse | Raw content-only descriptions are incomplete if used alone | Keep resolver exceptions in the current audit; eventual UI must derive the full approved effect list from shared typed data |
| Current incoming charge requires actual direct Health loss; several old documents describe broader absorption | A Shield hit is not universally an incoming-charge trigger | Preserve that distinction; proposed absorption-charge effects explicitly name it |
| Native seasonal/War/Calamitic contracts contain seven stats, Skill Power and criticals | Historical numbers are not current Radiant behavior | No native skill restoration, affinity matrix or random criticals |
| Reclaimed War and Moon share equipment origins but different motives/palettes | Copying their old resources would make them mechanical twins | Moon: remembrance, release, shared futures; War: crossings, transferred tension, convoy order and selective breach |
| Sunshade has no released Radiant values | Calling its old native effects current would imply activation | Separate proposed four-stat baselines and inactive status; no event launch |

### Shared wording, clocks and compatibility

Player-facing lines below use compact clauses, not explanatory paragraphs.
For sheet density only: **A/D/R** means the caster's current Attack/Defense/
Recovery; **H** means each recipient's maximum Health. **PC** is personal charge;
**SC** is shared charge. These abbreviations must expand to full labels in the
actual shared UI description functions. Every damage clause uses the bearer's
canonical element; there is no hidden elemental weakness multiplier.

| Reference concept | Last Light term / actual rule |
|---|---|
| Leader | First squad member's Leader skill; active only while that member lives |
| Ordinary / stronger / ultimate burst | Glowing Flare (form 1+, C PC); Lustrous Flare (form 4+, 2C PC); Eternal Radiant Flare (final form, 2C PC + full SC) |
| Extra skill / sphere | Passive / one compatible personal Master plus ordinary Conduits |
| Battle crystals / burst gauge | Gauge drops / personal charge; not inventory pickups |
| Ultimate meter | Shared Eternal meter; full threshold 100, then 125/150/175/200 after successive Eternal casts; capped at 200 |
| Healing crystals / Karma / experience bonuses | No equivalent proposed; no healing pickups, extra account experience or reward bonuses |
| Fire / water / earth / thunder / light / dark | Infernic / Oceanic / Botanic / Atmospheric / Tranquilitic / Chaotic; thematic classification, no affinity advantage |
| Health / Attack / Defense / Recovery | Four actual combat stats; Health in prose, not historical Direct Attack or Skill Power |
| Shield | Persists until broken; additive, uncapped Shield total; existing ordering and Burn bypass unchanged |
| Burn | Periodic damage per enemy phase, snapshotted from caster A; bypasses Shields under existing rules |
| Weaken / Exposure | Less outgoing direct damage / more incoming direct damage; not Defense destruction |
| Renewal / Seed | Round-start healing / existing delayed seed effect; no new healing item |
| Normal / Defense | Existing one-action commands unchanged unless a conditional enhancement is stated below |

**Intensity ladder (optional labels, never substitutes for numbers):** for
positive stat/effect increases: boosts (1-19%), greatly (20-39%), hugely
(40-59%), enormously (60-99%), massively (100%+). Direct-damage vocabulary is
separate: light (<150% A), strong (150-249%), powerful (250-399%), enormous
(400-599%), massive (600%+). Reduction percentages and resource amounts always
remain literal; do not describe 20 charge as a 20% boost. The sheets deliberately
prefer exact values over repetitive intensity adjectives.

**All proposed kit lines inherit these technical invariants:**

- One direct packet per named enemy target. No "N-hit", extra action, recast,
  double-cast, new random roll or additional hit-Gauge check is proposed.
  Normals retain 20 base hit charge, Flares 1 per qualifying target, defeat +5;
  first two eligible hit checks retain their separate 25% chance of +5.
  Other living squad members receive an additional 10% of the attacker's drop,
  not a division of it. Defense +10, round +5 and direct Health-loss intake +8
  retain their actual eligibility. Explicit grants below add to these rules,
  never replay the standard drop calculation. All caps still apply.
- Allies means living allies and includes the caster; "other" excludes them.
  Enemy debuffs require a surviving target. Lowest-Health selection means lowest
  Health percentage, then saved squad order. Enemy ties use encounter order.
  Percent-based missing Health uses the recipient, not the caster.
- An action's damage and existing conditions resolve before its new marks or
  debuffs; a spender snapshots and consumes its eligible pre-action resource.
  A spender cannot fund itself. No on-kill retargeting. Single-target secondary
  effects use the selected enemy, not an independently chosen victim.
- One round means the complete allied action phase and following enemy phase.
  "For N rounds" on allied buffs covers the current round plus the next N-1;
  Renewal "N round starts" explicitly means the next N starts. EP statuses
  cover the next N enemy phases. First-hit effects survive until used or their
  stated EP window ends. No implicit expiration of Shields.
- Effects refresh by source, not multiply-stack the same source. Existing
  cross-source status composition and mitigation floors remain unchanged;
  combined reductions can never bypass the engine's 20% damage multiplier
  floor. Passive/Leader presence bonuses stop immediately when their owner dies.
  Already-created Shields and ordinary snapshotted timed statuses follow their
  existing lifetime, not a hidden owner-alive cancellation.
- Native triggers accept authored direct actions or explicitly named native
  healing/absorption only. Conduit damage/healing, periodic damage, Master
  follow-ups and another triggered effect never recursively fund them.
  Generated packets earn no hit motes. Charge grants never trigger grants.
  A once-per-round guard is per effect owner unless a recipient is named.
- Base costs and four-stat baselines remain unchanged for the 32 live bearers.
  Proposed Sunshade values appear explicitly in their sheets. Glowing costs C,
  Lustrous 2C, Eternal 2C + full SC; each tier header below gives exact costs.
  Tier selection retains the actual ready-tier rules, not a new selector.
- All 114 Master names and IDs remain the current catalog identities. M1/M2/M3
  in a sheet mean `master-<sheet ID>-1/2/3` respectively; their names appear in
  the current snapshot above. Only one can be equipped. Corona = +25% Attack,
  -10% Health; Aegis = +35% Defense, -10% Attack; Solstice = +25% Health,
  -10% Attack; Prism = +30% Recovery, -10% Defense; Equinox = no stat change.
  Every Master line names one of these complete packages, not an extra bonus
  to be added to the old Master effect.

### New Mechanic Ledger (all proposed, approval required)

Every new effect below is declared here before use. No implementation is
authorized by its presence. Existing Burn/Weaken/Exposure/heal/Shield/Renewal/
Attack buff primitives are reused, but new triggers/targets still need work.

| ID / disposition | Definition, users and bounds | Engine / authority / state / presentation | Balance risk / bound |
|---|---|---|---|
| N1: adopt bounded native resources | Source-owned counters, marks, vouchers and modes; each sheet states capacity, gain, spender and payoff. Unstated start = 0, encounter reset; no loadout/account field. User-specific lists in coverage matrix | Typed battle-state collections, validated source IDs/caps and trigger guards in client/server; new rules version and restart path; named text badges pending icons | Burst banking; no self-funding, generated recursion, cross-owner spending or carry between staged encounters |
| N2: adapt compound Leaders and conditional enhancements | Multiple named stats plus fixed bounded action triggers, Normal/Flare multipliers, pierce, Defense bonuses or allied discounts to incoming damage. All 38 Leaders; no cost reduction | Extend typed Leader effects; saved leader and living-owner gates; use shared effects readouts; no wallet changes | Multipliers and control may outpace single-stat Leaders; test six-member combinations, preserve damage floor; no stat-conversion or maximum-Health direct-damage formula |
| N3: adopt delayed native deliveries | Atmoso's storm, Orvella's settlement, Maerion's reserve, Asteriel's gifts, Rhaziel's repair, Thessara's delivery, Elaris's routes, Veyr's aftershock; exact sheet windows and caps | Snapshot amount at creation, store target/source/due clock in battle state; dead recipients skipped without reassignment except a sheet's explicit lowest-Health selection; phase-resolution events on both authorities; text pending icons | No extra action/roll, finite expiry, no recursion; delayed damage is generated, not another qualifying Flare hit |
| N4: adapt Burn consumption and deterministic sequencing | Infernis consumes own Burn; Crinso alternates Gold/Crimson; Myrthen harvests own Burn; Vaelor chains different allies. Exact counts below | Track native source and action history in battle state; do not consume gear Burns or reinterpret old authored counters; independent VFX paths | Burst/charge loops; fixed caps and single packet, no second hit drops |
| N5: adopt cleanses and limited prevention | Aurora removes allied Weaken; Ilyss removes allied Burn/Weaken; Oryn prevents one application. Exact selectors below | Validate eligible status kind/owner/recipient; distinguish prevention/removal from healing; battle events and finite badges | Control immunity trivializes enemies; no blanket permanent immunity or lost enemy turns |
| N6: adapt redirection and target guidance | Caevren transfers part of one ally's direct Health-bound damage; Aureth guides eligible random single-target selection to self; Ozriel intercepts one fatal allied hit without survival | Explicit damage pipeline after original target mitigation/Shield, before Health loss; transferred amount hits protector Health, no second mitigation/Shield/charge/reflect/redirect; source packet/once guards. Aureth changes eligible random-target choice only, never scripts/AoE | Protector may die; no revival or immortality; original packet total never increases from transfer, no recursive absorption |
| N7: adopt explicit native charge support | Fixed grants from named triggers/thresholds, current per-member cap, no negative cost or SC donation. All charge-support sheets | Existing grant helpers plus per-source recipient guards; exact-tenths representation; shared cap; no new RNG | Accelerates Eternal; grants cannot fund grants; baseline C unchanged; six-member pressure/economy reruns required |
| N8: adopt conditional next-packet enhancement | Vespera Signal, Rosetta Quarry contribution, Disciple Instructions, Bliss Stillfeather, Oryn Accord, Kaelith Incision, Velmira Breach, Nerithe Survey; exact scope and expiry below | Source-owned effect consumed by eligible authored direct action, once per action regardless of enemy count; first packet/target filters explicit. Not a new crit, Spark hit or double cast | Coordinated damage spike; one voucher/source/recipient unless count stated, stronger refresh; no generated/periodic consumption |
| N9: adopt Shield break/overflow accounting | Tizu absorption, Thornia traps, Rhaziel repair, Neralis surplus, Varkhel transfer; own native Shields only; effective amounts only | Maintain source and remaining Shield serials, effective absorption and actual native overheal; split break/absorption events; preserve uncapped Shield total and order | Infinite sustain; no new resource from refreshed/uneaten Shields, no treating overheal as effective healing |
| N10: adapt extended native status targets | Selective cleanse, self/lowest-Health heal, conditional Defense enhancement, first-hit direct DR and explicit one-enemy debuffs on allied-support Flares | Extend typed offers, shared text, target validation and event ordering; all peers use matching rules | Hidden extra targets; target clauses mandatory, damage floor retained |
| N11: reject additional ailments | No Curse/Paralysis/Poison or action-denial status | No implementation or new art | Avoid turn-locking and duplicating Burn |
| N12: reject revive, criticals, affinity and action multiplication | No survival-at-1, resurrection, random crit, elemental weakness matrix, stealth, recast/double-cast or Normal hit-count buffs | Existing direct packet and RNG streams unchanged | Avoid systemic gauge/balance migration disguised as one kit |
| N13: defer reward Leaders | No Prismatica/material/drop-rate/Null-Prismatica or event reward effects in any sheet | Separate economy proposal required before reward/receipt/RNG code changes | No extra income, cost or reward RNG from this proposal |

All adopted rows require a rules-version bump, matching client/authority
validation and deployment, historical-encounter restart with frozen loadouts and
saved rewards retained, and new serialization tests. No account-schema expansion,
load-time write, pity change, schedule activation or automatic acquisition is
proposed. Retry restores the encounter's initial native resources/guards; Settings
preserves them. Training continuation preserves finite timed effects/resources
under its current carry-state contract; staged Continue starts fresh native
resources while retaining the existing Gauge/loadout rules. Round guards reset
only at a new round, never by opening Settings.

### Complete proposed sheets

All values below are **first-pass proposed tuning**, not simulated clear rates
or owner approval. Primary/secondary archetypes and identity evidence appear in
each sheet; every line is complete without referring to a lower tier. Ordinary
Leader and Passive coefficients use their saved respective Imbue channels;
Flare coefficients use Signature. Each legacy Imbue remains +50% to that
channel's numeric potency. Counts/caps, durations, resource grants, pierce,
reduction percentages, conditions and Master add-ons are fixed unless explicitly
named as scalable. Heal/Shield/Burn/damage bases and additive buff magnitudes
scale; when an enhancement replaces a base coefficient, apply it before channel
potency. No implicit Skill Power returns. Master-only generated additions use
their printed stat coefficient and compatible gear modifier, not Imbue power.

#### Infernis (`ember`) - live / Infernic

Primary: own-Burn detonation; secondary: front-line sustain. His advancing
greatsword and widening flame wings turn banked embers into a decisive strike.
Ledger: N1/N2/N4/N7/N10.

- **Leader: March of the Unspent Sun.** Allies: +25% Health, +20% Attack; Normal damage to a Burning enemy restores 8 PC to the attacker (once per attacker per round).
- **Passive: Embersteel Oath.** Self: +20% Defense while any enemy carries Infernis's Burn; Normal damage adds 1 Ember Seal (cap 3, once per round).
- **Glowing Flare: Cinderwake** [form 1+, 30 PC]. One enemy: 160% A damage, Burn (15% A, 2 EP); self: Shield (50% D); consume all Ember Seals for +20 percentage points of direct damage each.
- **Lustrous Flare: Cinderwake Ascendant** [form 4+, 60 PC]. All enemies: 250% A damage, Burn (20% A, 2 EP); allies: +20% Attack for 2 rounds; consume all Ember Seals for +30 percentage points of direct damage each.
- **Eternal Radiant Flare: Cinderwake Everlasting** [final form, 60 PC + full SC]. All enemies: consume Infernis's existing Burn for its remaining damage, then 400% A direct damage and Burn (25% A, 3 EP); allies: Shield (100% D); consume all Ember Seals for +40 percentage points of direct damage each.
- **Master 1: Helios Pyre Cathedral - Corona.** Cinderwake-family Burn lasts +1 EP; detonation consumes that additional phase.
- **Master 2: Cinderstar Genesis Engine - Corona.** Lustrous gains +40 percentage points of direct damage; at 3 Ember Seals, its Attack buff becomes 30%.
- **Master 3: Unbroken Sunforge Throne - Solstice.** Each Cinderwake cast grants self Shield (10% H); consuming 3 Ember Seals also heals self (40% R).

#### Tizu (`tide`) - live / Oceanic

Primary: absorption-funded tide; secondary: low-cost mitigation. Spear currents
hold a defense, then return the pressure without turning him into a damage copy.
Ledger: N1/N2/N7/N9/N10.

- **Leader: Pearlcurrent Formation.** Allies: +30% Defense, +15% Health; first Defense per ally per encounter grants Shield (8% H).
- **Passive: Tidal Memory.** Tizu's native Shields absorbing direct damage grant 1 Tide (cap 3, once per EP); self: +10% Defense per Tide.
- **Glowing Flare: Tideglass Shelter** [form 1+, 25 PC]. Allies: Shield (100% D + 5% H); consume all Tide to heal allies (15% R per Tide).
- **Lustrous Flare: Tideglass Dominion** [form 4+, 50 PC]. Allies: Shield (150% D + 8% H), direct damage reduction (20%, 1 EP); consume all Tide for +3 percentage points of reduction per Tide.
- **Eternal Radiant Flare: Tideglass Eternity** [final form, 50 PC + full SC]. Allies: Shield (220% D + 12% H), direct damage reduction (25%, 2 EP), heal (70% R); consume all Tide to grant allies 3 PC per Tide.
- **Master 1: Abyssal Shelter Observatory - Aegis.** Tideglass Shield Defense coefficient +30 percentage points; native absorption grants 2 Tide instead of 1.
- **Master 2: Ocean Memory Worldpump - Solstice.** Lustrous additionally Shields the lowest-Health ally (12% H); Eternal's immediate heal becomes 100% R.
- **Master 3: Undertow Sovereign Harpoon - Corona.** Each Tideglass cast damages one selected enemy (100% A generated); spending 3 Tide inflicts Weaken (15%, 1 EP) on that survivor.

#### Flora (`sprout`) - live / Botanic

Primary: effective-healing cultivation; secondary: sustained recovery. Her bow's
leaf branches grow from healing that actually reaches someone, not unused output.
Ledger: N1/N2/N5/N7/N10.

- **Leader: A Garden Given Freely.** Allies: +30% Recovery, +20% Health; native healing from below 50% to at least 50% Health grants its recipient 5 PC (once per recipient per round).
- **Passive: Living Bloom.** Native healing restores actual Health: gain 1 Bloom (cap 3, once per round); self: +10% Recovery per Bloom.
- **Glowing Flare: Dawnseed Renewal** [form 1+, 20 PC]. Allies: heal (90% R), Renewal (20% R, 2 round starts); consume all Blooms for +10 percentage points of immediate healing per Bloom.
- **Lustrous Flare: Dawnseed Flourishing** [form 4+, 40 PC]. Allies: heal (130% R), Renewal (25% R, 2 round starts), Shield (30% R); consume all Blooms for +15 percentage points of Shield per Bloom.
- **Eternal Radiant Flare: Dawnseed Perennial** [final form, 40 PC + full SC]. Allies: heal (180% R), Renewal (35% R, 3 round starts), remove strongest Weaken; consume all Blooms for +20 percentage points of immediate healing per Bloom.
- **Master 1: Worldseed Mercy Foundry - Prism.** Dawnseed immediate healing +20 percentage points; healing an ally below 25% Health adds 1 Bloom (once per cast).
- **Master 2: Briar Constellation Loom - Corona.** Dawnseed also damages one selected enemy (90% A generated); at 3 spent Blooms, that survivor gains Exposure (15%, 1 EP).
- **Master 3: Evergreen Continuance Crucible - Solstice.** Dawnseed Renewal lasts +1 round start; Eternal additionally Shields allies (10% H).

#### Rosetta (`rosetta`) - live / Tranquilitic

Primary: distinct-contributor Quarry; secondary: precision support. A single
rose bow directs several allies' attention rather than firing anonymous AoE.
Ledger: N1/N2/N8.

- **Leader: The Rose Draws Dawn.** Allies: +25% Attack, +15% Recovery; Normal damage to Rosetta's Quarry ignores 10% Defense.
- **Passive: Witnessed Quarry.** Normal damage marks its enemy as Quarry for 2 EP (one Quarry); each other ally's native direct action against it adds one distinct contributor (cap 3); Rosetta gains 3 PC per new contributor.
- **Glowing Flare: Daybreak Rose** [form 1+, 32 PC]. One enemy: 180% A damage, Exposure (15%, 1 EP); mark as Quarry for 2 EP, replacing prior Quarry and contributor list.
- **Lustrous Flare: Rose of Shared Purpose** [form 4+, 64 PC]. One enemy: 280% A damage, +35 percentage points per existing Quarry contributor (max 385% A); allies: +20% Attack for 2 rounds; replace Quarry on target for 2 EP with no contributors.
- **Eternal Radiant Flare: Beyond the Sun** [final form, 64 PC + full SC]. One enemy: 450% A damage, +50 percentage points per existing Quarry contributor (max 600% A), Exposure (25%, 2 EP); allies: heal (60% R); replace Quarry on target for 3 EP with no contributors.
- **Master 1: Rose Beyond the Sun Orrery - Corona.** Quarry lasts +1 EP; first distinct contributor each round gains Shield (30% R).
- **Master 2: Virtuous Planet Rosegarden - Corona.** Lustrous contributor bonus becomes +50 percentage points each (max 430% A); at 3 contributors, Rosetta gains 8 PC after spending.
- **Master 3: Golden Thorn Judgment Loom - Prism.** Eternal heals allies (100% R instead of 60%); every newly marked Quarry grants lowest-Health ally Shield (50% R), once per cast.

#### Thornia (`thornia`) - live / Chaotic

Primary: break-triggered thorn trap; secondary: squad barrier. Her greatsword
and enclosing rose-thorn fans punish pressure against the defense she built.
Ledger: N1/N2/N9.

- **Leader: Forbidden Garden Vow.** Allies: +25% Health, +20% Defense; while carrying a Thornia native Shield, +15% Normal damage.
- **Passive: Thorns Remember.** A Thornia native Shield breaking plants 1 Thorn Trap on its direct attacker (cap 3 per enemy, once per attacker per EP); self: +15% Defense while any Trap exists.
- **Glowing Flare: Gilded Briar** [form 1+, 34 PC]. Allies: Shield (90% D); one selected enemy: Weaken (15%, 1 EP), 1 Thorn Trap.
- **Lustrous Flare: Forbidden Roseguard** [form 4+, 68 PC]. One enemy: 220% A damage, consume its Traps for +50 percentage points each; allies: Shield (140% D + 5% H).
- **Eternal Radiant Flare: Thousand-Rose Reprisal** [final form, 68 PC + full SC]. All enemies: 330% A damage, consume their respective Traps for +70 percentage points each, Weaken (20%, 2 EP); allies: Shield (180% D + 8% H).
- **Master 1: Forbidden Garden Worldlock - Aegis.** Breaking a Thornia native Shield also Shields its holder (35% D), once per recipient per EP; this replacement cannot plant Traps.
- **Master 2: Thousand-Rose Planetary Aegis - Solstice.** Glowing plants 2 Traps instead of 1; Eternal's Health-based Shield becomes 12% H.
- **Master 3: Shadow Rose Sovereign Foundry - Corona.** Lustrous Trap payoff +70 instead of +50 percentage points each; consuming 3 Traps grants self 10 PC.

#### Crinso (`crinso`) - live / Chaotic

Primary: alternating blade modes; secondary: tempo damage. His connected
dual-ended sword alternates gold preparation and crimson discharge.
Ledger: N1/N2/N4/N7.

- **Leader: Two Edges, One Vow.** Allies: +25% Attack, +15% Health; each ally's first Normal after using Defense gains +25% direct damage (once per round).
- **Passive: Crimson-Gold Duality.** Start in Gold; after each native damaging action alternate Gold/Crimson. Gold grants self Shield (40% D); Crimson gains 1 Combo (cap 3).
- **Glowing Flare: Twin-Rose Edge** [form 1+, 34 PC]. One enemy: 190% A damage; Gold: self +20% Attack for 2 rounds; Crimson: target Exposure (15%, 1 EP).
- **Lustrous Flare: Beautiful Ruin** [form 4+, 68 PC]. One enemy: 300% A damage; Gold: allies Shield (70% D); Crimson: consume all Combo for +35 percentage points of direct damage each.
- **Eternal Radiant Flare: Beyond Duality** [final form, 68 PC + full SC]. One enemy: 470% A damage; allies: Shield (100% D), +25% Attack for 2 rounds; consume all Combo for +50 percentage points of direct damage each; reset mode to Gold after resolution.
- **Master 1: Twin-Rose Singularity Drive - Corona.** Gold actions' self-Shield becomes 70% D; first Crimson action each round grants 4 PC.
- **Master 2: Duality Planet Flamewheel - Solstice.** Lustrous in Gold heals self (60% R); Lustrous in Crimson also grants allies Shield (50% D).
- **Master 3: Crimson Beauty Pyre Requiem - Prism.** Eternal consumes 3 Combo: allies heal (100% R); otherwise self gains 8 PC.

#### Atmoso (`atmoso`) - live / Atmospheric

Primary: stored-storm release; secondary: formation-wide exposure. Staff-driven
wind becomes a finite storm, not extra undocumented hits.
Ledger: N1/N2/N3.

- **Leader: Open-Sky Advance.** Allies: +25% Attack, +15% Recovery; Normal damage to Exposed enemies grants 4 PC (once per attacker per round).
- **Passive: Gather the Crosswind.** Normal damage adds 1 Gale (cap 3, once per round); at round start with 3 Gale, self gains +20% Attack for that round.
- **Glowing Flare: Horizon Spiral** [form 1+, 30 PC]. All enemies: 140% A damage, Exposure (10%, 1 EP); self: +15% Attack for 1 round.
- **Lustrous Flare: Cyclone Unfurled** [form 4+, 60 PC]. All enemies: 220% A damage, Exposure (15%, 2 EP); consume all Gale to store Storm (40% A per Gale), released as generated damage to surviving enemies after next EP.
- **Eternal Radiant Flare: Sky Without End** [final form, 60 PC + full SC]. All enemies: 360% A damage, Exposure (25%, 2 EP); allies: +25% Attack for 2 rounds; consume all Gale to store Storm (60% A per Gale), released after next EP.
- **Master 1: Sky Without End Turbine - Corona.** Horizon Spiral grants 1 Gale after its damage (once per cast); stored Storm cannot generate Gale.
- **Master 2: Horizon Cyclone Orrery - Prism.** Cyclone Unfurled's Storm also heals allies (20% R per spent Gale) when it releases.
- **Master 3: Crosswind Imperial Drive - Solstice.** Sky Without End also grants allies Shield (70% D); stored Storm lasts through Atmoso's defeat but still releases only once.

#### Aurora (`aurora`) - live / Tranquilitic

Primary: diminishing enemy pressure through lens seals; secondary: cleanse.
Empty-hand lens casting observes and weakens, never becomes a copied healer bow.
Ledger: N1/N2/N5/N10.

- **Leader: Light Without Sentence.** Allies: +25% Health, +20% Recovery; direct damage from Weakened enemies is reduced by 10%.
- **Passive: Measured Lens.** An enemy with Aurora's Weaken damages allied Health: gain 1 Seal (cap 3, once per EP); Defense removes strongest Weaken from lowest-Health ally.
- **Glowing Flare: Dawnlens Decree** [form 1+, 34 PC]. One enemy: 150% A damage, Weaken (20%, 2 EP); lowest-Health ally: heal (50% R).
- **Lustrous Flare: Prismseal Horizon** [form 4+, 68 PC]. All enemies: 210% A damage, Weaken (25%, 2 EP); allies: remove strongest Weaken; consume all Seals for Shield (25% R per Seal).
- **Eternal Radiant Flare: Merciful Eclipse** [final form, 68 PC + full SC]. All enemies: 320% A damage, Weaken (30%, 3 EP), Exposure (15%, 2 EP); allies: remove strongest Weaken, heal (90% R); consume all Seals for +20 percentage points of healing each.
- **Master 1: Final Dawn Tribunal - Prism.** Defense's successful cleanse also heals its recipient (40% R); no cleanse means no heal.
- **Master 2: Prismseal Astral Judiciary - Solstice.** Prismseal Horizon's Shield becomes 40% R per Seal; consuming 3 Seals grants allies 5 PC.
- **Master 3: Merciful Eclipse Regulator - Aegis.** Merciful Eclipse's Weaken lasts +1 EP; self gains Shield (100% D) on cast.

#### Bliss (`bliss`) - live / Tranquilitic

Primary: unbroken-Health feather poise; secondary: fan shelter. Paired fans
reward maintained composure rather than low-Health brute force.
Ledger: N1/N2/N8/N10.

- **Leader: Quiet Heaven's Grace.** Allies: +25% Recovery, +20% Attack; above 80% Health, +15% native Flare direct damage.
- **Passive: Stillfeather Poise.** End an EP with no direct Health loss to Bliss: gain 1 Poise (cap 3); Normal damage at 3 Poise heals lowest-Health ally (35% R).
- **Glowing Flare: Featherwake** [form 1+, 34 PC]. One enemy: 180% A damage; allies: heal (40% R); self: Shield (40% R).
- **Lustrous Flare: Celestial Fanfall** [form 4+, 68 PC]. All enemies: 260% A damage; allies: heal (65% R), Shield (60% R); consume all Poise for +25 percentage points of direct damage each.
- **Eternal Radiant Flare: Stillplume Zenith** [final form, 68 PC + full SC]. All enemies: 400% A damage; allies: heal (100% R), direct damage reduction (15%, 2 EP); consume all Poise for +35 percentage points of direct damage each.
- **Master 1: Thousandfeather Zenith Loom - Prism.** Featherwake's allied heal becomes 65% R; its self-Shield becomes 65% R.
- **Master 2: Stillplume Planetary Ballet - Corona.** At 3 Poise, Celestial Fanfall ignores 20% Defense; Poise is still consumed.
- **Master 3: Quiet Heaven Fanforge - Solstice.** Stillplume Zenith additionally grants each other ally Stillfeather: next native damaging Flare +20% direct damage, expires after 2 rounds.

#### Bruno (`bruno`) - live / Botanic

Primary: rooted hammer stance; secondary: persistent shielding. Basalt armor
and one hammer build a defense by choosing to hold position.
Ledger: N1/N2/N10.

- **Leader: Worldwall Foundation.** Allies: +30% Defense, +15% Health; Defense grants +15% Defense through the next EP.
- **Passive: Rooted Gravitas.** Defense adds 1 Bedrock (cap 3); native damaging action consumes 1 Bedrock for +40% Normal direct damage or +20% Flare direct damage.
- **Glowing Flare: Basalt Embrace** [form 1+, 30 PC]. Allies: Shield (100% D); self: +20% Defense for 2 rounds, gain 1 Bedrock.
- **Lustrous Flare: Atlas Hammerfall** [form 4+, 60 PC]. One enemy: 260% A damage, Weaken (15%, 2 EP); allies: Shield (160% D); self: gain 1 Bedrock after impact.
- **Eternal Radiant Flare: Living Worldwall** [final form, 60 PC + full SC]. All enemies: 340% A damage, Weaken (20%, 2 EP); allies: Shield (220% D + 8% H), direct damage reduction (15%, 1 EP); self: gain 2 Bedrock after impact.
- **Master 1: Living Worldwall Atlas - Aegis.** Bedrock also grants Bruno +8% Defense per stored stack.
- **Master 2: Quarry Planet Gravitas - Solstice.** Atlas Hammerfall additionally Shields lowest-Health ally (15% H); no replacement of existing Shields.
- **Master 3: Worldforge Hammer Dominion - Corona.** Consuming Bedrock on Living Worldwall adds +60 percentage points of direct damage; its Weaken becomes 25%.

#### Disciple (`disciple`) - live / Chaotic

Primary: ordered Instructions; secondary: action-strength support. Empty-hand
mindcrown links reward passing a clear instruction to the next ally.
Ledger: N1/N2/N7/N8.

- **Leader: Unbound Concord.** Allies: +20% Attack, +25% Recovery; consuming Disciple's Instruction restores 5 PC to its holder (once per holder per round).
- **Passive: Thought Passed Forward.** Normal damage grants next living unacted other ally Instruction: next native direct action +20% damage, expires at round end (one per recipient); consuming it Shields Disciple (35% R).
- **Glowing Flare: Mindcrown Link** [form 1+, 34 PC]. Allies: +20% Attack for 2 rounds; next living unacted other ally: Instruction (+30% next native direct action, expires at round end).
- **Lustrous Flare: Concord Thoughtforge** [form 4+, 68 PC]. Allies: +25% Attack for 2 rounds, Shield (65% R); each other unacted ally: Instruction (+30% next native direct action, expires at round end).
- **Eternal Radiant Flare: Sovereign Will** [final form, 68 PC + full SC]. Allies: +35% Attack for 3 rounds, Shield (100% R), heal (70% R); each other ally: Instruction (+40% next native direct action, expires after 2 rounds).
- **Master 1: Unbound Mindcrown Synapse - Prism.** Thought Passed Forward's Shield becomes 60% R; first Instruction consumed each round heals its holder (30% R).
- **Master 2: Concord Planet Thoughtforge - Corona.** Concord Thoughtforge additionally grants Disciple an Instruction (+30%, expires at next round end).
- **Master 3: Sovereign Will Amplifier - Solstice.** Sovereign Will Instructions also ignore 10% Defense; each holder still consumes only one voucher.

#### Elise (`elise`) - live / Atmospheric

Primary: two-blade throw/recall; secondary: target piercing. Exactly two
shuriken create a bounded placement decision, not fictitious multi-hit text.
Ledger: N1/N2/N8.

- **Leader: Twin-Star Circuit.** Allies: +25% Attack; native direct damage ignores 10% Defense against enemies holding Elise's Blade.
- **Passive: Two Stars Return.** Normal damage lodges 1 Blade on its target (2 total across enemies); at capacity, recall oldest Blade for self Shield (40% D), then lodge the new Blade.
- **Glowing Flare: Thunderwheel Cast** [form 1+, 30 PC]. One enemy: 180% A damage, Exposure (10%, 1 EP); lodge 1 Blade, recalling oldest for self Shield (40% D) if at capacity.
- **Lustrous Flare: Twin-Star Recall** [form 4+, 60 PC]. One enemy: 260% A damage, +60 percentage points for each Blade on that target (max 380% A), Weaken (15%, 1 EP); recall all Blades from it; self: 5 PC per recalled Blade.
- **Eternal Radiant Flare: Infinite Thunderwheel** [final form, 60 PC + full SC]. All enemies: 380% A damage, +75 percentage points per Blade on each target, Exposure (20%, 2 EP); recall all Blades; allies: Shield (80% D).
- **Master 1: Infinite Thunderwheel Arsenal - Corona.** Recalling oldest at capacity grants self 5 PC and Shield (60% D instead of 40%).
- **Master 2: Twin Star Planetary Ratchet - Corona.** Twin-Star Recall's Blade payoff becomes +85 percentage points each; recalling 2 removes target's strongest Exposure after impact and grants self +25% Attack for 2 rounds.
- **Master 3: Storm Empress Execution Clock - Aegis.** Infinite Thunderwheel's Shield becomes 130% D; each Blade recalled adds 5% H to allies' Shield.

#### Razor (`razor`) - live / Chaotic

Primary: endured-damage Wounds payoff; secondary: sword guard. His night sword
answers damage he actually survived, not arbitrary critical rolls.
Ledger: N1/N2/N10.

- **Leader: Midnight Holds.** Allies: +25% Health, +20% Defense; below 50% Health, +20% Normal direct damage.
- **Passive: Nightglass Wounds.** Direct enemy Health loss adds 1 Wound (cap 3, once per EP); Defense grants self Shield (40% D + 3% H).
- **Glowing Flare: Eclipse Guard** [form 1+, 34 PC]. One enemy: 180% A damage, Weaken (15%, 1 EP); self: Shield (90% D).
- **Lustrous Flare: Counterblade Oath** [form 4+, 68 PC]. One enemy: 280% A damage; consume all Wounds for +40 percentage points each; self: heal (25% R per Wound), Shield (100% D).
- **Eternal Radiant Flare: Unbroken Midnight** [final form, 68 PC + full SC]. All enemies: 410% A damage, Weaken (20%, 2 EP); consume all Wounds for +55 percentage points each; allies: Shield (100% D); self: heal (80% R).
- **Master 1: Unbroken Midnight Bastion - Aegis.** Eclipse Guard's self-Shield becomes 140% D; at 3 Wounds gain direct damage reduction (15%, 1 EP).
- **Master 2: Eclipse Planet Watchtower - Corona.** Counterblade Oath at 3 Wounds ignores 20% Defense; its healing becomes 40% R per Wound.
- **Master 3: Nightglass Counterblade Engine - Solstice.** Unbroken Midnight grants self an additional Shield (15% H); consuming 3 Wounds removes strongest Burn from self.

#### Nerithe (`nerithe`) - live / Oceanic

Primary: survey coverage; secondary: precision charge. Her surveyor trident
maps distinct enemies before exploiting a chosen line.
Ledger: N1/N2/N7/N8.

- **Leader: Chart the Crossing.** Allies: +25% Attack, +15% Recovery; Normal damage to Surveyed enemies grants 4 PC (once per attacker per round).
- **Passive: Surveyor's Reach.** Normal damage Surveys its target for 2 EP; first Survey of a distinct enemy each encounter grants self 5 PC; Surveyed enemies take +15% direct damage from Nerithe.
- **Glowing Flare: Currentline Mark** [form 1+, 34 PC]. One enemy: 190% A damage, Survey (2 EP), Weaken (15%, 1 EP).
- **Lustrous Flare: Sounding the Weir** [form 4+, 68 PC]. All enemies: 250% A damage, Survey (2 EP); self: +5 PC per target already Surveyed before cast (max 15 PC).
- **Eternal Radiant Flare: Unbroken Chart** [final form, 68 PC + full SC]. One enemy: 460% A damage, +40 percentage points per currently Surveyed enemy (max 580% A), Weaken (25%, 2 EP); allies: Shield (70% D); refresh target's Survey (3 EP).
- **Master 1: Shoreless Meridian Worldchart - Corona.** Survey lasts +1 EP; first Survey of an enemy also grants self Shield (30% D).
- **Master 2: Folded Ocean Planetarium - Corona.** Sounding the Weir's refund cap becomes 20 PC; already-Surveyed targets also gain Exposure (15%, 1 EP).
- **Master 3: Abyssal Surveyor Crown - Prism.** Unbroken Chart heals lowest-Health ally (120% R); each currently Surveyed enemy adds 20% R, max 180% R.

#### Orvella (`orvella`) - live / Botanic

Primary: finite Foundation settlement; secondary: team fortification. The
crystal mace builds a prepared position before settling it into one payoff.
Ledger: N1/N2/N3.

- **Leader: Foundation for the Living.** Allies: +25% Defense, +20% Health; while carrying Orvella's native Shield, +15% Attack.
- **Passive: Patient Masonry.** Defense builds 1 Foundation (cap 3); round start with Foundation heals lowest-Health ally (15% R per Foundation).
- **Glowing Flare: Crystal Footing** [form 1+, 34 PC]. Allies: Shield (100% D); self: build 1 Foundation, +15% Defense for 2 rounds.
- **Lustrous Flare: Keystone Settlement** [form 4+, 68 PC]. One enemy: 230% A damage, Weaken (20%, 1 EP); allies: Shield (150% D); consume all Foundation to store settlement healing (30% R each), delivered to allies at next round start.
- **Eternal Radiant Flare: Earth Remembers Shelter** [final form, 68 PC + full SC]. All enemies: 350% A damage, Weaken (25%, 2 EP); allies: Shield (210% D); consume all Foundation to store settlement healing (45% R each), delivered to allies at next round start.
- **Master 1: Throne Beneath the World - Aegis.** Foundation's round-start heal becomes 25% R per stack; no heal if Orvella is defeated.
- **Master 2: Deep Foundation Planetpress - Solstice.** Keystone Settlement's delayed delivery additionally Shields each recipient (5% H per spent Foundation).
- **Master 3: Keystone Sovereign Counterweight - Corona.** Earth Remembers Shelter adds +45 percentage points of direct damage per spent Foundation.

#### Vaelor (`vaelor`) - live / Atmospheric

Primary: different-ally cadence; secondary: resonance damage. The resonance
blade builds a choir from successive voices, not repeated attacks by one owner.
Ledger: N1/N2/N4/N7.

- **Leader: Thunder Choir Advance.** Allies: +25% Attack; after a different ally's native damaging action, next ally's native direct damage +15% during the same round.
- **Passive: Resonant Sequence.** Each consecutive native damaging action by a different ally adds 1 Cadence (cap 3); non-damaging actions reset sequence history, not stored Cadence; Vaelor's Normal at 3 Cadence grants 5 PC.
- **Glowing Flare: Resonance Cut** [form 1+, 34 PC]. One enemy: 190% A damage, Exposure (15%, 1 EP); self: +15% Attack for 1 round.
- **Lustrous Flare: Crescendo Edge** [form 4+, 68 PC]. One enemy: 300% A damage; consume all Cadence for +35 percentage points each; allies: +20% Attack for 2 rounds.
- **Eternal Radiant Flare: Choir Across the Rift** [final form, 68 PC + full SC]. All enemies: 410% A damage, Exposure (20%, 2 EP); consume all Cadence for +45 percentage points each; allies: +30% Attack for 2 rounds.
- **Master 1: Final Chord Celestial Resonator - Corona.** At 3 Cadence, Resonance Cut grants each other ally 3 PC.
- **Master 2: Thunder Choir Planetary Fugue - Corona.** Crescendo Edge's payoff becomes +50 percentage points per Cadence; consuming 3 Shields self (80% D).
- **Master 3: Broken Sky Imperial Metronome - Solstice.** Choir Across the Rift at 3 Cadence grants allies direct damage reduction (15%, 1 EP).

#### Caldrex (`caldrex`) - live / Infernic

Primary: absorption-returned forge heat; secondary: squad protection.
Gauntlets and furnace plates temper pressure into Burn, rather than a sword combo.
Ledger: N1/N2/N9.

- **Leader: Hold the Furnace Line.** Allies: +30% Defense, +15% Health; direct damage from Burning enemies reduced by 10%.
- **Passive: Tempered Reprisal.** Direct absorption by Caldrex's native Shields adds 1 Heat (cap 3, once per EP); its attacker receives Burn (10% A, 1 EP).
- **Glowing Flare: Kilnwall Brace** [form 1+, 34 PC]. Allies: Shield (110% D); one selected enemy: Burn (15% A, 2 EP); self: +15% Defense for 2 rounds.
- **Lustrous Flare: Red-Hot Return** [form 4+, 68 PC]. One enemy: 260% A damage, Burn (20% A, 2 EP); allies: Shield (150% D); consume all Heat for +20 percentage points of Shield each.
- **Eternal Radiant Flare: The Forge Holds** [final form, 68 PC + full SC]. All enemies: 350% A damage, Burn (25% A, 3 EP); allies: Shield (210% D), direct damage reduction (15%, 1 EP); consume all Heat for +30 percentage points of Shield each.
- **Master 1: Banked-Sun Pressure Accumulator - Aegis.** Tempered Reprisal's Burn becomes 15% A; at 3 Heat self gains +15% Defense.
- **Master 2: Counterstroke Recoil Foundry - Solstice.** Red-Hot Return additionally heals lowest-Health ally (30% R per Heat spent).
- **Master 3: Cinderpulse Triage Converter - Corona.** The Forge Holds gains +35 percentage points of direct damage per spent Heat; its Burn lasts +1 EP.

#### Solenne (`solenne`) - live / Tranquilitic

Primary: first-hit bell intervals; secondary: low-Health shelter. A bell shield
offers a discrete safe opening, not permanent control of every enemy action.
Ledger: N1/N2/N10.

- **Leader: Vesper Procession.** Allies: +25% Health, +20% Defense; below 50% Health, native healing received +20%.
- **Passive: Bell Between Blows.** Defense grants each ally Stillness (15% reduction to next direct hit, expires after 1 EP); each consumed Stillness heals Solenne (20% R), max 3 heals per EP.
- **Glowing Flare: Vesper Chime** [form 1+, 34 PC]. Allies: Shield (90% D), Stillness (20% next direct-hit reduction, 1 EP).
- **Lustrous Flare: Cloister of Quiet** [form 4+, 68 PC]. Allies: Shield (140% D), Stillness (25% next direct-hit reduction, 2 EP); lowest-Health ally: heal (90% R).
- **Eternal Radiant Flare: Unbroken Sanctuary Bell** [final form, 68 PC + full SC]. Allies: Shield (190% D + 8% H), Stillness (30% next direct-hit reduction, 2 EP), heal (110% R); enemies: Weaken (15%, 2 EP).
- **Master 1: Stillpoint Inertial Governor - Aegis.** Vesper Chime's Stillness also grants recipient Shield (25% D) when consumed.
- **Master 2: Quiet-Arc Shelter Projector - Solstice.** Cloister of Quiet heals its lowest-Health target (130% R instead of 90%); successful healing grants that target 8 PC.
- **Master 3: Cadence Differential Drive - Prism.** Unbroken Sanctuary Bell's healing becomes 150% R; one consumed Stillness per ally also removes their strongest Weaken.

#### Myrthen (`myrthen`) - live / Botanic

Primary: own-Burn harvest; secondary: wound recovery. Chained sickles reap
remaining growth as immediate healing, not another generic burn detonator.
Ledger: N1/N2/N4/N10.

- **Leader: Season of Return.** Allies: +25% Attack, +20% Recovery; Normal damage to Burning enemies heals attacker (15% of their own Recovery, once per attacker per round).
- **Passive: Patient Harvest.** Myrthen's Burn dealing Health damage adds 1 Harvest (cap 3, once per EP); self: +10% Attack per Harvest.
- **Glowing Flare: Sickle in the Ash** [form 1+, 34 PC]. One enemy: 190% A damage, Burn (15% A, 2 EP); self: heal (35% R).
- **Lustrous Flare: Chain of Returning Seasons** [form 4+, 68 PC]. One enemy: 300% A damage; remove Myrthen's existing Burn from target; allies: heal (80% R + 20% R per removed remaining Burn phase); consume all Harvest for +20 percentage points of healing each.
- **Eternal Radiant Flare: Orchard Beyond the Ash** [final form, 68 PC + full SC]. All enemies: 390% A damage, Burn (25% A, 3 EP); allies: heal (120% R), Renewal (20% R, 2 round starts); consume all Harvest for +40 percentage points of direct damage each.
- **Master 1: Seasonwheel Harvest Transmission - Corona.** Sickle in the Ash against Myrthen's already-Burning target adds +40 percentage points of direct damage.
- **Master 2: Seedtrace Pursuit Distributor - Corona.** Chain of Returning Seasons heals an additional 30% R per removed Burn phase; consuming 3 Harvest grants self 10 PC.
- **Master 3: Reaping-Tide Recovery Dynamo - Prism.** Orchard Beyond the Ash's Renewal becomes 35% R; 3 spent Harvest also remove strongest Burn from allies.

#### Neralis (`neralis`) - live / Oceanic

Primary: surplus-to-crossing barrier; secondary: rescue healing. The hooked
river polearm saves unused aid as shelter at the next crossing.
Ledger: N1/N2/N9/N10.

- **Leader: Every Crossing Returns.** Allies: +25% Health, +25% Recovery; below 40% Health, direct damage taken reduced by 10%.
- **Passive: No Aid Abandoned.** Neralis's immediate native overheal becomes self-owned Reserve (cap 100% R); Normal damage converts all Reserve to Shield on lowest-Health ally (once per round).
- **Glowing Flare: Returning Current** [form 1+, 34 PC]. Allies: heal (85% R); lowest-Health ally: Shield (60% R).
- **Lustrous Flare: Weirline Homeward** [form 4+, 68 PC]. Allies: heal (125% R), Renewal (20% R, 2 round starts); lowest-Health ally: Shield (80% R + stored Reserve), spend all Reserve.
- **Eternal Radiant Flare: The River Keeps Its Promise** [final form, 68 PC + full SC]. Allies: heal (175% R), Shield (80% R), Renewal (30% R, 3 round starts); lowest-Health ally: additional Shield equal to all stored Reserve, spend Reserve.
- **Master 1: Amber-Station Return Manifold - Prism.** Reserve capacity becomes 150% R; Normal conversion also grants its recipient 5 PC.
- **Master 2: Blackwing Crossing Stabilizer - Solstice.** Weirline Homeward's lowest-Health target also gains direct damage reduction (20%, 1 EP).
- **Master 3: Weirheart Recollection Dynamo - Aegis.** The River Keeps Its Promise grants an additional allied Shield (40% D); after spending Reserve, self gains Shield (50% D).

#### Varkhel (`varkhel`) - live / Infernic

Primary: next-ally tension relay; secondary: defensive momentum. His linked
counterweight passes a finite protective load along squad order.
Ledger: N1/N2/N9.

- **Leader: The Line Does Not Break.** Allies: +25% Defense, +20% Health; native direct damage while Shielded +15%.
- **Passive: Tension Passed.** Normal damage grants next living unacted other ally Tension Shield (60% D); its direct absorption adds 1 Load to Varkhel (cap 3, once per EP).
- **Glowing Flare: Counterweight Relay** [form 1+, 34 PC]. Allies: Shield (90% D); next living unacted other ally: +25% Attack for 1 round.
- **Lustrous Flare: Shared Burden Ignition** [form 4+, 68 PC]. One enemy: 240% A damage, Burn (15% A, 2 EP); allies: Shield (140% D); consume all Load for +30 percentage points of Shield each.
- **Eternal Radiant Flare: No Link Abandoned** [final form, 68 PC + full SC]. All enemies: 340% A damage, Weaken (20%, 2 EP); allies: Shield (190% D), +25% Attack for 2 rounds; consume all Load for +35 percentage points of Shield each.
- **Master 1: Faultstar Chain Accumulator - Aegis.** Tension Shield becomes 90% D; its break heals its holder (30% R), once per recipient per EP.
- **Master 2: Scarlet-Hinge Load Distributor - Solstice.** Shared Burden Ignition adds Shield (5% H per spent Load) to lowest-Health ally.
- **Master 3: Recoil-Star Compression Turbine - Corona.** No Link Abandoned gains +40 percentage points of direct damage per Load; first Load spent grants self 5 PC.

#### Seravelle (`seravelle`) - live / Infernic

Primary: convoy roster coverage; secondary: ordered attack support. Her silver
lance opens a protected route for every squad position, not one chosen carry.
Ledger: N1/N2/N7/N8.

- **Leader: Convoy of the Unforgotten.** Allies: +20% Attack, +20% Defense; Seravelle's escorted allies gain +10% Normal damage.
- **Passive: Count Every Traveler.** Native Normal or Defense escorts the first living unescorted ally in squad order for the encounter; that ally gains Shield (50% R); each newly escorted ally grants Seravelle 3 PC.
- **Glowing Flare: Silver Route** [form 1+, 34 PC]. One enemy: 160% A damage, Weaken (15%, 1 EP); escort lowest-Health unescorted ally, Shield that ally (70% R).
- **Lustrous Flare: Procession Through Fire** [form 4+, 68 PC]. Allies: +25% Attack for 2 rounds, Shield (80% R); escort up to 2 living unescorted allies in squad order.
- **Eternal Radiant Flare: No Traveler Behind** [final form, 68 PC + full SC]. All enemies: 300% A damage, Weaken (20%, 2 EP); allies: Shield (120% R), +30% Attack for 2 rounds; escort all living unescorted allies.
- **Master 1: Ashroad Cadence Transmission - Prism.** First escort of each ally also heals that ally (40% R); no effect for already-escorted allies.
- **Master 2: Convoy-Flame Distribution Crown - Corona.** Procession Through Fire grants escorted allies next native direct action +20% damage, expires after 2 rounds.
- **Master 3: Braided-Signal Continuance Engine - Solstice.** No Traveler Behind grants allies 2 PC per escorted living ally (max 12 PC per recipient).

#### Velmira (`velmira`) - live / Chaotic

Primary: Weaken-to-breach execution; secondary: selective exposure. Paired
crescent cutters find one doorway in an existing defense.
Ledger: N1/N2/N8.

- **Leader: A Doorway in the Siege.** Allies: +25% Attack; against Weakened enemies, native direct damage ignores 10% Defense.
- **Passive: Find the Hinge.** Normal damage to a Weakened enemy adds 1 Breach (cap 3 on one marked enemy); each Breach grants Velmira +10% direct damage against that enemy.
- **Glowing Flare: Crescent Aperture** [form 1+, 34 PC]. One enemy: 200% A damage, Weaken (20%, 2 EP), Exposure (10%, 1 EP).
- **Lustrous Flare: Hinge Without a Wall** [form 4+, 68 PC]. One enemy: 310% A damage, Exposure (20%, 2 EP); consume target's Breach for +35 percentage points each; self: Shield (60% D).
- **Eternal Radiant Flare: The Siege Opens Inward** [final form, 68 PC + full SC]. One enemy: 480% A damage, Weaken (25%, 2 EP), Exposure (25%, 2 EP); consume target's Breach for +50 percentage points each; allies: Shield (70% D).
- **Master 1: Twin-Edge Sequence Orrery - Corona.** Crescent Aperture against an already-Weakened target adds 1 Breach after impact.
- **Master 2: Goldseam Precision Fracturer - Corona.** Hinge Without a Wall at 3 Breach ignores 20% Defense; its self-Shield becomes 100% D.
- **Master 3: Open-Threshold Return Drive - Aegis.** The Siege Opens Inward's allied Shield becomes 120% D; 3 consumed Breach grant allies 5 PC.

#### Maerion (`maerion`) - live / Oceanic

Primary: remembered-loss reserve; secondary: delayed rescue. Ferry tokens
record actual harm and return it as aid without claiming resurrection.
Ledger: N1/N2/N3.

- **Leader: The Ferry Remains Open.** Allies: +30% Health, +20% Recovery; first native heal on each ally below 50% Health each round grants Shield (5% recipient H).
- **Passive: Unreturned Passage.** Direct allied Health loss stores 20% of actual loss in Maerion's Passage (cap 100% R); Defense heals lowest-Health ally for all Passage and empties it.
- **Glowing Flare: Crescent Mercy** [form 1+, 34 PC]. Allies: heal (85% R), Renewal (20% R, 2 round starts); lowest-Health ally: heal all stored Passage, spend Passage.
- **Lustrous Flare: A Place on the Ferry** [form 4+, 68 PC]. Allies: heal (125% R), Shield (60% R); spend Passage to schedule lowest-Health living ally healing for that amount at next round start.
- **Eternal Radiant Flare: Every Name Carried Home** [final form, 68 PC + full SC]. Allies: heal (180% R), Renewal (30% R, 3 round starts), Shield (80% R); spend Passage to heal lowest-Health living ally for that amount immediately.
- **Master 1: Unreturned Voyage Worldpump - Prism.** Passage stores 30% of direct allied Health loss and caps at 150% R.
- **Master 2: Crescent Rib Mercy Foundry - Solstice.** A Place on the Ferry's scheduled heal grants its eventual recipient Shield equal to 50% of scheduled amount, even if healing is ineffective.
- **Master 3: Ferrywake Remembrance Dynamo - Aegis.** Every Name Carried Home additionally grants allies direct damage reduction (15%, 1 EP); spending Passage grants self Shield (60% D).

#### Caevren (`caevren`) - live / Atmospheric

Primary: counterweight damage sharing; secondary: Load defense. The caged
weight carries another's burden without erasing its cost.
Ledger: N1/N2/N6.

- **Leader: Hold the Meridian.** Allies: +30% Defense, +20% Health; first direct hit per ally per EP deals 10% less damage.
- **Passive: Weight Accepted.** Each direct enemy action damaging Caevren's Health grants 1 Load (cap 3, once per EP); self: +10% Defense per Load.
- **Glowing Flare: Meridian Brace** [form 1+, 34 PC]. Allies: Shield (100% D); lowest-Health other ally: redirect 20% of direct Health-bound damage to Caevren for 1 EP.
- **Lustrous Flare: Counterweight Covenant** [form 4+, 68 PC]. Allies: Shield (150% D); lowest-Health other ally: redirect 25% of direct Health-bound damage to Caevren for 2 EP; consume all Load to heal self (25% R each).
- **Eternal Radiant Flare: No Star Falls Unheld** [final form, 68 PC + full SC]. Allies: Shield (220% D); other allies: redirect 20% of direct Health-bound damage to Caevren for 1 EP; consume all Load for +25 percentage points of Shield each.
- **Master 1: Meridian Counterweight Atlas - Aegis.** Load capacity becomes 4; Meridian Brace heals self (15% R per stored Load) without spending Load.
- **Master 2: Observatory Loadshare Regulator - Solstice.** Counterweight Covenant's redirection becomes 35%; self gains Shield (12% H) before enemy phases.
- **Master 3: Falling-Star Recoil Turbine - Prism.** No Star Falls Unheld additionally grants self Renewal (40% R, 2 round starts); redirected Health loss grants 5 PC, once per EP.

#### Vespera (`vespera`) - live / Infernic

Primary: issued Signal vouchers; secondary: burning road support. Her standard
directs another ally's next strike, not a second version of Infernis's bank.
Ledger: N1/N2/N7/N8.

- **Leader: Keep the Last Beacon.** Allies: +25% Attack, +20% Health; native direct actions consuming Vespera's Signal gain 5 PC (once per holder per round).
- **Passive: Unextinguished Signal.** Defense issues Signal to next living unacted other ally: next native direct action +25% damage, expires at round end; consuming Signal adds 1 Beacon (cap 3).
- **Glowing Flare: Whitefire Road** [form 1+, 34 PC]. One enemy: 150% A damage, Burn (15% A, 2 EP); next living unacted other ally: Signal (+30%, expires at round end).
- **Lustrous Flare: Procession of Beacons** [form 4+, 68 PC]. All enemies: 230% A damage, Burn (20% A, 2 EP); each other unacted ally: Signal (+30%, expires at round end); consume all Beacon for allied Shield (25% R each).
- **Eternal Radiant Flare: None Left in the Dark** [final form, 68 PC + full SC]. All enemies: 350% A damage, Burn (25% A, 3 EP); each other ally: Signal (+40%, expires after 2 rounds); consume all Beacon for allied Shield (40% R each).
- **Master 1: Whitefire Procession Transmitter - Corona.** Beacon capacity becomes 4; Whitefire Road's Signal becomes +40%.
- **Master 2: Mirror-Pennant Ignition Crown - Prism.** Procession of Beacons' Signal additionally ignores 15% Defense against a target carrying Vespera's Burn.
- **Master 3: Unextinguished Relay Cathedral - Solstice.** None Left in the Dark grants lowest-Health ally additional Shield (15% H); first consumed Signal each round heals its holder (40% R).

#### Ilyss (`ilyss`) - live / Chaotic

Primary: harmful-link removal; secondary: rescue recovery. Connected shears
cut a harmful effect, not a life/death boundary.
Ledger: N1/N2/N5/N7.

- **Leader: The Living Thread.** Allies: +25% Health, +25% Recovery; successful native cleanse grants its recipient 5 PC (once per recipient per round).
- **Passive: Sever What Harms.** Removing an allied Burn or Weaken adds 1 Severance (cap 3, once per recipient per action); Defense removes strongest Burn or, if absent, strongest Weaken from lowest-Health ally.
- **Glowing Flare: Unbind the Living** [form 1+, 34 PC]. Lowest-Health ally: remove strongest Burn and strongest Weaken, heal (120% R); self: Shield (40% R).
- **Lustrous Flare: Mercy Between Links** [form 4+, 68 PC]. Allies: remove strongest Burn and strongest Weaken, heal (100% R); consume all Severance for +20 percentage points of healing each.
- **Eternal Radiant Flare: What Harm Cannot Hold** [final form, 68 PC + full SC]. Allies: remove strongest Burn and strongest Weaken, heal (150% R), Renewal (25% R, 2 round starts); consume all Severance for Shield (30% R each).
- **Master 1: Crescent-Link Severance Loom - Prism.** Severance capacity becomes 4; Mercy Between Links' healing bonus becomes +25 percentage points per stack.
- **Master 2: Unbinding Mercy Worldlock - Solstice.** Unbind the Living additionally Shields its recipient (10% H) if it removes at least one effect.
- **Master 3: Broken-Link Continuance Engine - Aegis.** What Harm Cannot Hold grants each cleansed ally direct damage reduction (15%, 1 EP).

#### Asteriel (`asteriel`) - live / Botanic

Primary: lent Moonflower maturity; secondary: future sustain. An orbiting
seed library lends aid to others instead of hoarding another self buff.
Ledger: N1/N2/N3/N7.

- **Leader: Unhoarded Stars.** Allies: +25% Recovery, +20% Health; receiving Asteriel's matured Moonflower grants 5 PC (once per recipient per round).
- **Passive: A Future Lent.** Defense plants Moonflower on lowest-Health other ally; it heals (50% R) at next round start (one pending Moonflower per recipient); matured flowers grant Asteriel 1 Promise (cap 3).
- **Glowing Flare: Moonflower Loan** [form 1+, 34 PC]. Allies: heal (60% R); lowest-Health other ally: plant Moonflower (80% R, next round start).
- **Lustrous Flare: Open Conservatory** [form 4+, 68 PC]. Allies: heal (100% R), plant Moonflower (70% R, next round start); consume all Promise for allied Shield (25% R each).
- **Eternal Radiant Flare: Every Orbit Bears a Future** [final form, 68 PC + full SC]. Allies: heal (145% R), plant Moonflower (100% R, next round start), Renewal (20% R, 2 round starts); consume all Promise for +20 percentage points of immediate healing each.
- **Master 1: Moonflower Seedworld Orrery - Prism.** Promise capacity becomes 4; Moonflower Loan's delayed heal becomes 120% R.
- **Master 2: Night-Library Germination Vault - Prism.** Open Conservatory's Moonflowers Shield their recipients (40% R) at maturity, regardless of effective healing.
- **Master 3: Freely-Given Starseed Distributor - Solstice.** Every Orbit Bears a Future's Moonflowers remove strongest Weaken from their recipient at maturity.

#### Serapha (`serapha`) - live / Tranquilitic

Primary: enemy-action ceasefire response; secondary: escorted recovery. The
split-oval scepter leaves an interval for aid while enemies still take their turns.
Ledger: N1/N2/N5/N10.

- **Leader: Passage Without Surrender.** Allies: +25% Health, +20% Recovery; direct damage from Serapha-Weakened enemies reduced by 10%.
- **Passive: Open Interval.** A Serapha-Weakened enemy uses a direct action: heal lowest-Health ally (30% R), gain 1 Interval (cap 3, once per EP).
- **Glowing Flare: Unstruck Verdict** [form 1+, 34 PC]. One enemy: Weaken (25%, 2 EP); allies: heal (75% R), Shield (40% R).
- **Lustrous Flare: Sanctuary in the Interval** [form 4+, 68 PC]. All enemies: Weaken (25%, 2 EP); allies: heal (110% R), Shield (70% R); consume all Interval for +15 percentage points of Shield each.
- **Eternal Radiant Flare: Let Them Leave Alive** [final form, 68 PC + full SC]. All enemies: Weaken (30%, 3 EP); allies: heal (160% R), Shield (100% R), remove strongest Weaken; consume all Interval for +20 percentage points of healing each.
- **Master 1: Open-Arc Sanctuary Regulator - Solstice.** Interval capacity becomes 4; Open Interval's heal becomes 45% R.
- **Master 2: Articulated Mercy Fanforge - Aegis.** Sanctuary in the Interval adds direct damage reduction (15%, 1 EP) to lowest-Health ally.
- **Master 3: Unstruck Verdict Concordance - Prism.** Let Them Leave Alive grants allies 3 PC per Interval spent (max 12 PC).

#### Rhaziel (`rhaziel`) - inactive Sunshade / Infernic

Primary: remembered Shield repair; secondary: armor sustain. Forge needle and
anvil gauntlet repair damage actually absorbed, not damage fabricated by a timer.
Proposed base H/A/D/R = 280/40/22/68, C = 34. Ledger: N1/N2/N3/N9.

- **Leader: A Defense Worth Returning To.** Allies: +25% Defense, +25% Recovery; native Shield absorption heals its holder (10% of absorbed damage, max 10% recipient H per EP).
- **Passive: Remembered Dents.** Rhaziel's native Shields store Repair equal to 20% of their direct absorption (per recipient, cap 50% R); at next round start spend each Repair to heal its holder.
- **Glowing Flare: Anvil-Needle Stitch** [form 1+, 34 PC]. Allies: Shield (80% D + 40% R); lowest-Health ally: heal (60% R).
- **Lustrous Flare: Borrowed-Dawn Seam** [form 4+, 68 PC]. Allies: Shield (130% D + 60% R), heal (80% R); each recipient's next Repair delivery gains +20% R.
- **Eternal Radiant Flare: Every Join Remembered** [final form, 68 PC + full SC]. Allies: Shield (180% D + 80% R), heal (120% R), +20% Defense for 2 rounds; each recipient's next Repair delivery gains +40% R.
- **Master 1: Anvil-Needle Restoration Foundry - Prism.** Repair stores 30% of absorption, capacity 75% R per recipient.
- **Master 2: Borrowed-Dawn Seam Cathedral - Solstice.** Borrowed-Dawn Seam's Shields breaking grant holder +20% Defense for 2 rounds, once per holder per EP.
- **Master 3: Remembered-Dent Repair Dynamo - Aegis.** Effective Repair delivery grants its holder 6 PC, once per recipient per round; no charge for ineffective healing.

#### Oryn (`oryn`) - inactive Sunshade / Tranquilitic

Primary: terms-and-accord pairing; secondary: limited prevention. An unstruck
square seal makes conditions that leave a way out, not an enemy turn skip.
Proposed base H/A/D/R = 275/44/21/60, C = 34. Ledger: N1/N2/N5/N8.

- **Leader: An Exit in the Agreement.** Allies: +25% Health, +20% Attack; attacking an enemy with Oryn's Terms heals attacker (20% of their own Recovery, once per attacker per round).
- **Passive: Unforced Accord.** Defense places Terms on selected enemy for 2 EP; next living unacted other ally gains Accord (+25% next native direct damage against Terms, expires at round end).
- **Glowing Flare: Open-Threshold Seal** [form 1+, 34 PC]. One enemy: 140% A damage, Terms (2 EP), Weaken (15%, 1 EP); lowest-Health ally: Shield (50% R).
- **Lustrous Flare: Agreement Without Sentence** [form 4+, 68 PC]. One enemy: 240% A damage, Terms (2 EP), Weaken (20%, 2 EP); other allies: Accord (+30% next native direct damage against Terms, expires after 2 rounds).
- **Eternal Radiant Flare: No Victory Requires This** [final form, 68 PC + full SC]. All enemies: 320% A damage, Terms (3 EP), Weaken (25%, 2 EP); allies: Shield (90% R), prevent next Burn or Weaken application through next EP (one prevention per recipient).
- **Master 1: Unstruck Seal Arbitration Engine - Prism.** Accord's printed direct-damage bonus gains +15 percentage points.
- **Master 2: Open-Threshold Oath Worldlock - Solstice.** Agreement Without Sentence grants lowest-Health ally Shield (15% H).
- **Master 3: Sunshade Concordance Distributor - Aegis.** No Victory Requires This's successful prevention heals its holder (50% R), once per recipient per cast.

#### Thessara (`thessara`) - inactive Sunshade / Oceanic

Primary: two-vessel delivery; secondary: targeted charge redistribution. Her
paired reservoirs route a measured reserve to people not reached by the first flow.
Proposed base H/A/D/R = 285/42/20/66, C = 34. Ledger: N1/N2/N3/N7.

- **Leader: No Village Omitted.** Allies: +25% Health, +20% Recovery; Thessara's Delivery recipients gain +20% Normal damage for 1 round.
- **Passive: Fill the Empty Channel.** Normal damage adds 1 Reserve (cap 4, once per round); Defense schedules Delivery to lowest-charge other ally: 5 PC per Reserve, spend all Reserve, deliver at next round start.
- **Glowing Flare: Paired-Vessel Promise** [form 1+, 34 PC]. Lowest-Health ally: heal (110% R), Shield (40% R); self: gain 1 Reserve.
- **Lustrous Flare: Deliver What Was Promised** [form 4+, 68 PC]. Allies: heal (105% R); lowest-charge other ally: schedule Delivery (6 PC and 20% R healing per Reserve, next round start), spend all Reserve.
- **Eternal Radiant Flare: The Unomitted Reservoir** [final form, 68 PC + full SC]. Allies: heal (150% R), Shield (80% R); other allies: schedule Delivery (3 PC and 15% R healing per Reserve, next round start), spend all Reserve.
- **Master 1: Twin-Vessel Reservoir Worldpump - Prism.** Reserve capacity becomes 5; Paired-Vessel Promise's immediate heal becomes 150% R.
- **Master 2: Unomitted Channel Manifold - Solstice.** Deliver What Was Promised Shields its Delivery recipient (5% H per Reserve spent) when delivered.
- **Master 3: Droughtbreak Delivery Dynamo - Aegis.** The Unomitted Reservoir's Delivery grant becomes 4 PC per Reserve; its Shield becomes 120% R.

#### Elaris (`elaris`) - inactive Sunshade / Botanic

Primary: branching route payoffs; secondary: ally access through Defense.
A branching javelin opens distinct firebreaks rather than copying aerial swords.
Proposed base H/A/D/R = 245/60/16/40, C = 34. Ledger: N1/N2/N3/N8.

- **Leader: Grove Beyond the Walls.** Allies: +25% Attack, +15% Health; while carrying Elaris's Open Route, native direct damage ignores 10% Defense.
- **Passive: Branch the Firebreak.** Normal damage to a new enemy each encounter adds 1 Branch (cap 3); Defense adds 1 Branch, once per round.
- **Glowing Flare: Mark the Firebreak** [form 1+, 34 PC]. One enemy: 190% A damage, Exposure (15%, 1 EP); gain 1 Branch after damage.
- **Lustrous Flare: Spear-Grove Passage** [form 4+, 68 PC]. One enemy: 290% A damage; consume all Branch for +35 percentage points each; other allies: Open Route (+15% next native direct damage, expires after 2 rounds).
- **Eternal Radiant Flare: A Grove Beyond Burning Walls** [final form, 68 PC + full SC]. All enemies: 410% A damage, Exposure (20%, 2 EP); consume all Branch for +45 percentage points each; allies: Open Route (+25% next native direct damage, expires after 2 rounds).
- **Master 1: Spear-Grove Breakthrough Crown - Corona.** Branch capacity becomes 4; Mark the Firebreak's Exposure lasts +1 EP.
- **Master 2: Seedpod Pursuit Foundry - Corona.** Spear-Grove Passage also heals lowest-Health ally (25% R per Branch spent).
- **Master 3: Firebreak Route-Opening Turbine - Prism.** A Grove Beyond Burning Walls' Open Route grants holder Shield (50% R) when consumed.

#### Veyr (`veyr`) - inactive Sunshade / Chaotic

Primary: timed demolition fault; secondary: refuge shielding. The articulated
lance delays a measured collapse while keeping shelter separate from destruction.
Proposed base H/A/D/R = 250/62/17/35, C = 34. Ledger: N1/N2/N3/N8.

- **Leader: Only What Must Fall.** Allies: +25% Attack, +15% Defense; native direct damage to Veyr's Fault target ignores 10% Defense.
- **Passive: Read the Load Path.** Normal damage adds 1 Fault to selected enemy (cap 3, one marked enemy); each Fault makes that enemy take +5% direct damage from Veyr.
- **Glowing Flare: Precision Wedge** [form 1+, 34 PC]. One enemy: 200% A damage, Exposure (15%, 1 EP); add 1 Fault after damage.
- **Lustrous Flare: Three-Brace Demolition** [form 4+, 68 PC]. One enemy: 290% A damage; consume its Fault to schedule Aftershock (45% A per Fault, generated after next EP); allies: Shield (50% D).
- **Eternal Radiant Flare: What Remains Standing** [final form, 68 PC + full SC]. All enemies: 390% A damage, Weaken (20%, 2 EP); consume marked target's Fault to schedule its Aftershock (65% A per Fault, after next EP); allies: Shield (90% D).
- **Master 1: Precision Faultworld Dismantler - Corona.** Fault capacity becomes 4; Precision Wedge also grants self 3 PC if target was already marked.
- **Master 2: Three-Brace Demolition Orrery - Corona.** Three-Brace Demolition's Aftershock becomes 65% A per Fault; no additional hit charge.
- **Master 3: Refuge-Sparing Siege Regulator - Solstice.** What Remains Standing adds allied Shield (4% H per Fault spent).

#### Aureth (`aureth`) - inactive Sunshade / Atmospheric

Primary: moving rescue lead; secondary: earned Momentum protection. Fan shield
and command blade draw eligible pressure into an opening, not out of the battle.
Proposed base H/A/D/R = 335/43/28/32, C = 34. Ledger: N1/N2/N6/N7.

- **Leader: Hold the Burning Sky Open.** Allies: +25% Health, +25% Defense; native Defense grants 3 additional PC.
- **Passive: Moving Shelter.** Defense gains Lead for 1 EP: eligible random single-target direct enemy attacks select Aureth; direct Health or Shield damage during Lead adds 1 Momentum (cap 3, once per EP).
- **Glowing Flare: Keystone Advance** [form 1+, 34 PC]. Allies: Shield (110% D); self: Lead (1 EP), direct damage reduction (15%, 1 EP).
- **Lustrous Flare: Eclipse Canopy** [form 4+, 68 PC]. Allies: Shield (160% D), direct damage reduction (15%, 1 EP); self: Lead (1 EP); consume all Momentum for +25 percentage points of Shield each.
- **Eternal Radiant Flare: Moving-Horizon Corridor** [final form, 68 PC + full SC]. Allies: Shield (220% D + 8% H), direct damage reduction (20%, 2 EP), heal (70% R); self: Lead (1 EP); consume all Momentum for +30 percentage points of Shield each.
- **Master 1: Keystone Convection Worldshield - Aegis.** Momentum capacity becomes 4; Keystone Advance adds self Shield (8% H).
- **Master 2: Eclipse Canopy Rescue Foundry - Solstice.** Eclipse Canopy's direct damage reduction becomes 25%; Lead still expires after 1 EP.
- **Master 3: Moving-Horizon Corridor Turbine - Prism.** Moving-Horizon Corridor's heal becomes 110% R; Momentum spent grants allies 2 PC each (max 8 PC per recipient).

#### Ozriel (`ozriel`) - live Calamitic / Tranquilitic

Primary: costly fatal-hit intercession; secondary: crisis fortification.
Tower shield and glass halberd refuse abandonment, not death itself.
Ledger: N1/N2/N6/N10.

- **Leader: Refusal Beneath the Horizon.** Allies: +35% Health, +20% Defense; below 35% Health, native healing received +25%.
- **Passive: Take the Written Blow.** Once per encounter, a direct enemy hit would defeat another ally: transfer 40% of its remaining Health-bound damage to Ozriel; self may die, ally may still die; surviving Ozriel gains Shield (15% H).
- **Glowing Flare: Unmoved Star** [first form+, 34 PC]. Allies: Shield (130% D + 5% H); lowest-Health ally: direct damage reduction (20%, 1 EP).
- **Lustrous Flare: Bastion Against the End** [fourth form+, 68 PC]. Allies: Shield (190% D + 8% H), direct damage reduction (20%, 1 EP); self: heal (100% R).
- **Eternal Radiant Flare: Fate Finds a Shield** [final form, 68 PC + full SC]. Allies: Shield (260% D + 12% H), direct damage reduction (25%, 2 EP), heal (110% R); no reset of Take the Written Blow.
- **Master 1: Refusal Sovereign Heartdrive - Solstice.** Take the Written Blow transfers 50% instead of 40%; surviving Ozriel heals self (100% R).
- **Master 2: Absolution Planetary Suppressor - Aegis.** Bastion Against the End adds lowest-Health ally Shield (15% H); self heal becomes 140% R.
- **Master 3: Unfallen Continuum Worldengine - Corona.** Fate Finds a Shield damages one selected enemy (160% A generated), inflicts Weaken (20%, 2 EP); intercession is still once per encounter.

#### Ilvaris (`ilvaris`) - live Calamitic / Atmospheric

Primary: finite echo hymn; secondary: squad recovery. The glass halo-lyre
records a real heal, then echoes only part of it on a later beat.
Ledger: N1/N2/N3/N7.

- **Leader: Choir of Borrowed Tomorrows.** Allies: +35% Recovery, +20% Health; first effective native healing each ally receives per round grants them 4 PC.
- **Passive: Afterglass Hymn.** Ilvaris's immediate native healing records 20% of total effective healing as Echo (cap 150% R); at next round start, heal lowest-Health ally for Echo and empty it.
- **Glowing Flare: Halo-Lyre Refrain** [first form+, 34 PC]. Allies: heal (100% R), Renewal (25% R, 2 round starts); lowest-Health ally: Shield (50% R).
- **Lustrous Flare: Choir Across the Glass** [fourth form+, 68 PC]. Allies: heal (150% R), Renewal (30% R, 2 round starts), +20% Attack for 2 rounds.
- **Eternal Radiant Flare: The Unbroken Refrain** [final form, 68 PC + full SC]. Allies: heal (210% R), Renewal (40% R, 3 round starts), Shield (100% R), +25% Attack for 2 rounds.
- **Master 1: Unsung Verse Harmonic Supercharger - Prism.** Echo records 30% of effective healing and caps at 200% R; Echo healing cannot record another Echo.
- **Master 2: Hymnwind Imperial Turbine - Solstice.** Choir Across the Glass grants allies 5 PC after healing, once per recipient per cast.
- **Master 3: Severed Prophecy Chronodrive - Corona.** The Unbroken Refrain adds +20% native Flare direct damage for allies for 2 rounds; no generated-packet enhancement.

#### Kaelith (`kaelith`) - live Calamitic / Chaotic

Primary: source-limited Incision payoff; secondary: brief team vulnerability.
The shatterglass greatscythe opens a finite cut in a target's written defense.
Ledger: N1/N2/N8.

- **Leader: Unwrite the Sentence.** Allies: +30% Attack, +15% Health; native direct damage against a target with Kaelith's Incision ignores 10% Defense.
- **Passive: Fractalized Incision.** Native direct action adds 1 Incision per surviving target (cap 3 each, 2 EP); each Incision adds 5% incoming native direct damage from allies (max 15%).
- **Glowing Flare: Shatterfall** [first form+, 34 PC]. All enemies: 190% A damage, Exposure (10%, 1 EP); surviving targets gain Incision through Passive.
- **Lustrous Flare: Glass Meridian** [fourth form+, 68 PC]. One enemy: 320% A damage, +50 percentage points per existing Incision (max 470% A), Weaken (15%, 1 EP); consume its Incisions and suppress Passive's application for this cast.
- **Eternal Radiant Flare: Denial of Fate** [final form, 68 PC + full SC]. All enemies: 440% A damage, +60 percentage points per existing Incision (max 620% A), Exposure (20%, 2 EP); consume their Incisions and suppress Passive's application for this cast; self: Shield (8% H).
- **Master 1: Glass Meridian Singularity Harvester - Corona.** Incision duration becomes 3 EP; Shatterfall adds +30 percentage points of direct damage.
- **Master 2: Thousand-Fault Rupture Accelerator - Corona.** Glass Meridian at 3 Incisions ignores 20% Defense; self heals (60% R) after consuming them.
- **Master 3: Denied Fate Eclipse Annihilator - Aegis.** Denial of Fate's self-Shield becomes 15% H; consuming 3 Incisions from any target grants allies Shield (60% D), once per cast.

### Interaction decisions that must not be hidden in tooltip copy

**N1 data:** Ember Seal/Tide/Bloom/Gale/Seal/Poise/Bedrock/Cadence/Heat/
Harvest/Load/Beacon/Severance/Promise/Interval/Reserve/Branch/Fault/Momentum/
Wound/Combo are owner-local counters. Rosetta's contributors are distinct
saved bearer instance IDs. Elise has exactly two source-owned blade tokens,
oldest ordered by serial. Quarry/Survey/Terms/Incision/Breach target enemy
instance IDs, not species IDs. A new one-target Quarry/Breach/Fault target clears
the old target's mark/resource; Survey and Incision can cover multiple enemies.
No effect is consumed across owners. Presence bonuses read current resource;
spent resources cease granting their presence bonus before post-cast support.

**Durations:** unqualified counters persist for the current encounter. Trap,
Blade, Escort and Bedrock persist until spent/replaced or encounter ends.
Survey/Quarry/Terms/Incision have printed windows; their associated contributors/
Incisions clear on expiry. Fault/Breach have no timer but clear on target death
or replacement. Tension means only the specially sourced passive Shield, not
every Varkhel Shield. Native shield-held bonuses recognize any nonempty Shield
serial from the named bearer. A scheduled packet that loses its target expires,
does not attack a different enemy or grant a defeat.

**Specific selectors:** Infernis detonates only his native Burn; Myrthen harvests
only his native Burn and computes remaining phases before removal. Rosetta's
contributor payoff applies only when the selected target is her Quarry. Crinso
starts in Gold with 0 Combo; each damaging action, including a Flare, checks
pre-action mode and toggles after resolution (Eternal overrides final mode).
Bruno's damaging action consumes at most one pre-existing Bedrock, including a
Flare that creates more afterward. Vaelor observes one authored action, not one
target packet; first damaging action establishes previous actor but adds no
Cadence. Its Leader affects an action following a different ally, once for all
its targets; it is not accumulated each preceding action.

**Passage/Reserve/Echo/Repair:** snapshot caster R at storage to establish caps;
recompute the cap only on a new addition. Apply gear healing once to the final
delivery, never both record and delivery; effective input amounts already include
the original heal/mitigation. Maerion's redirected Health loss is not recorded.
Rhaziel's +20/40% R delivery enhancement is one pending voucher per recipient,
stronger refresh, expires after 2 round starts; it needs nonzero Repair and does
not fabricate a repair event. Neralis spends pre-cast Reserve before recording
that cast's new overheal; same-cast overheal cannot be spent. Ilvaris records only
immediate Flare healing; Renewal, Echo and gear healing do not feed Echo.
Maerion's scheduled heal selects lowest-Health ally at delivery, not creation.
Other scheduled allied deliveries retain their recipient.

**Vouchers:** Instruction, Signal, Stillfeather, Accord and Open Route have one
slot per source/recipient, stronger value refresh, independent sources remain
distinct. They apply to one qualifying authored direct action, not every hit,
and exclude generated/periodic output. Accord requires target Terms at action
start; nonmatching actions do not consume it. For multi-enemy actions, its bonus
applies only to enemies with Terms. One spell can consume multiple independently
sourced voucher kinds but never reissue them during the same action.

**Escort:** Seravelle includes herself in squad-order coverage; Glowing with no
unescorted ally grants its extra Shield to lowest-Health ally but no new escort
trigger. First escort adds the Passive's 50% R Shield, plus any printed Flare
Shield. No already-escorted refresh generates PC/healing. The per-round 3-PC
native guard is not used: escort grants 3 once per newly escorted bearer in the
entire encounter (at most 18 PC for six bearers). Her Eternal Master calculates
coverage after escorts are issued.

**Target guidance:** Oryn's Defense needs a valid selected enemy but remains a
Defense action, not a direct hit. Introduce the target affordance in the live
action UI only after approval. Aureth's Lead replaces only an existing random
single-target choice; it does not draw another RNG value, redirect AoE or alter
scripted targets. Caevren and Ozriel transfer only the residual direct Health
damage after original-target mitigation and Shield absorption; transfer itself
earns no incoming charge or native triggers. Caevren's standard direct Health
loss may grant Load; redirected loss grants it only if explicitly added later,
which this proposal does not do. Master 3's specific transferred-loss charge is
the sole stated exception. Ozriel's once guard is spent before applying damage;
no repeated check, revival, healing before the fatal check or guaranteed survival.

**Clocks and owner death:** finite Storm/Aftershock/deliveries require living
creator at delivery unless a Master explicitly exempts it; dead recipient means
skip, not revive. Own resource-presence stats stop on death. Transfer requires a
living protector and clears when protector dies; remaining attacks proceed
normally. Counter/resource events from an action become eligible only for a later
action's conditional spender, even when another enemy in the same AoE survives.

**Gear compatibility:** preserve every ordinary/Calamitic primitive and rank,
gear source ownership and fixed scaling. `normal`, `flare`, `pierce`, `cooperation`,
`next-buff`, `normal-expose`, `normal-weaken`, `normal-burn`, `leech`, `normal-heal`
still apply to their current native/generated categories. `healing`/`shielding`
modify final native output once. `heal-charge`/`heal-buff` must distinguish
effective healing from overheal; `absorbed-charge`/`reflect` must not count
transferred Health loss as Shield absorption. `leader` currently enhances a
single stat: propose applying it only to each Leader's *first printed stat*,
never its triggers or second stat. This is an explicit meaning extension requiring
approval and dedicated tests, not an accidental blanket compound multiplier.
Stat/Normal/Flare primitive magnitudes remain unchanged.

Expected value shifts needing before/after reporting: burn-related
`infernic-cinder-testament`, `cinder-metering-nozzle`, `emberlife-kiln` and
`calamitic-ruinmark-censer` must not supply native spendable Burns; `duplex-heart`,
`botanic-graft-covenant` and `aquatic-undertide-chronometer` gain more healing
opportunities, subject to their existing guards. `stasis-reliquary`,
`aquatic-leviathan-pump`, `tidebound-reflector`, `aegis-return-spring` and
`calamitic-aegis-engine-of-severed-fate` benefit from stronger Shields but not
recursive Repair/Load; `starvein-conductor`, `firstlight-cam`,
`atmospheric-skythread-rudder`, `pulse-trigger-pawl` and
`calamitic-throne-borrowed-tomorrows` need six-member charge saturation checks.
`tectonic-faultkeeper-loom`, `solace-anchor`, `firstlight-cam` and
`calamitic-choir-array-of-branded-stars` use the proposed first-stat Leader rule.
These are test obligations, not measured buffs or nerfs.

### Coverage matrix

Each row has a different primary mechanic. O/P/S/U = offense/protection/sustain/
utility; these roles describe contributions, not new account role bonuses.

| Element | Bearer | Primary mechanic | Secondary role | Coverage |
|---|---|---|---|---|
| Infernic | Infernis | Own-Burn remaining-phase detonation + Ember Seals | Sustain | O/P/U |
| Infernic | Vespera | Other-ally Signal issuance funds Beacon | Burn support | O/P/U |
| Infernic | Caldrex | Own-Shield absorption returns forge Burn/Heat | Mitigation | O/P/S/U |
| Infernic | Varkhel | Next-unacted Tension Shield relay | Shield scaling | O/P/S/U |
| Infernic | Seravelle | Once-per-encounter squad escort coverage | Attack support | O/P/S/U |
| Infernic | Rhaziel (inactive) | Per-recipient absorbed-damage Repair delivery | Defense sustain | P/S/U |
| Oceanic | Tizu | Absorption-funded Tide with distinct spenders | Mitigation | P/S/U |
| Oceanic | Nerithe | Distinct-enemy Survey coverage | Precision damage | O/P/S/U |
| Oceanic | Neralis | Native overheal Reserve converted to rescue Shield | Recovery | P/S/U |
| Oceanic | Maerion | Direct Health-loss Passage returned as aid | Delayed healing | P/S/U |
| Oceanic | Thessara (inactive) | Lowest-charge/two-vessel Reserve Delivery | Sustain | P/S/U |
| Botanic | Flora | Effective-heal Blooms spent on different aid | Renewal | P/S/U |
| Botanic | Bruno | Defense-built Bedrock boosts next hammer action | Shield wall | O/P/U |
| Botanic | Orvella | Foundation-funded scheduled settlement | Fortification | O/P/S/U |
| Botanic | Myrthen | Own-Burn remaining time harvested as healing | Damage | O/S/U |
| Botanic | Asteriel | Matured Moonflower loans fund Promise | Future sustain | P/S/U |
| Botanic | Elaris (inactive) | Distinct targets/Defense fund branching routes | Pierce support | O/P/S/U |
| Atmospheric | Atmoso | Banked Gale releases one delayed Storm | Exposure | O/P/S/U |
| Atmospheric | Elise | Exactly two placed Blade tokens recalled | Precision | O/P/U |
| Atmospheric | Vaelor | Different-ally action sequence funds Cadence | Team damage | O/P/U |
| Atmospheric | Caevren | Nonrecursive residual-damage sharing | Load defense | P/S/U |
| Atmospheric | Aureth (inactive) | Eligible random-target rescue Lead | Momentum wall | P/S/U |
| Atmospheric | Ilvaris | Effective immediate heals record one finite Echo | Renewal | P/S/U |
| Tranquilitic | Rosetta | Distinct contributor Quarry payoff | Precision | O/P/S/U |
| Tranquilitic | Aurora | Weakened-enemy Health pressure funds Seals | Cleanse | O/P/S/U |
| Tranquilitic | Bliss | No-direct-Health-loss Poise spent in fan Flares | Light sustain | O/P/S/U |
| Tranquilitic | Solenne | Per-recipient first-hit Stillness chimes | Shield healing | P/S/U |
| Tranquilitic | Serapha | Weakened-enemy actions create healing Interval | Mercy sustain | P/S/U |
| Tranquilitic | Oryn (inactive) | Terms target + conditional Accord pairing | Prevention | O/P/S/U |
| Tranquilitic | Ozriel | Once-only costly fatal-hit intercession | Crisis wall | O/P/S/U |
| Chaotic | Thornia | Own-Shield breaks plant enemy Traps | Greatsword wall | O/P/S/U |
| Chaotic | Crinso | Gold/Crimson action alternation funds Combo | Tempo | O/P/S/U |
| Chaotic | Disciple | Next-unacted Instruction consumption | Attack support | O/P/S/U |
| Chaotic | Razor | Survived direct-Health Wounds payoff | Guard | O/P/S/U |
| Chaotic | Velmira | Weaken-gated one-target Breach | Execution | O/P/U |
| Chaotic | Ilyss | Cleanse-funded Severance | Recovery | P/S/U |
| Chaotic | Veyr (inactive) | One-target Fault funds timed Aftershock | Refuge shielding | O/P/U |
| Chaotic | Kaelith | Per-target Incision native-team vulnerability | Execution | O/P/S/U |

All six elements have offensive, protective, sustain and utility options across
their members. Shared motifs do not imply shared resources: Rose coordinates
attention/retaliation/duality; Standard expresses equipment-led action choices;
War makes tactical routes and hard defenses; Moon preserves living choices and
future aid; Sunshade repairs and opens practical corridors; Calamitic pays a
bounded cost or collects a finite echo rather than granting immortality.

### Validation and implementation gates

Phase A is documentation, not balance certification. Structural checks must
prove 38 unique source IDs, 38 named Leaders, 38 named Passives, 114 independent
Flare lines and 114 named existing-ID Master alternatives; exact four-stat/C
baselines for all six inactive bearers; unchanged costs for all live bearers;
and unique primary-mechanic entries. Check all proposed attunements against live
Master assignments, with inactive choices labeled proposals.

After approval, implement starters, Rose, Standard, War, Moon, Sunshade and
Calamitic in approved batches (Sunshade remains inactive). Each batch requires
targeted source/target/death/clock/guard/Settings/Retry/continuation tests, all
ordinary and Calamitic gear primitive/rank compatibility, matching shared menu/
frozen-reference descriptions, locked/unlocked forms, exact charge accounting,
separate RNG and receipts, and serialized malformed-state rejection.

Run current equivalents of the original validation commands, not removed
`radiant-*` file names:

- `npx vitest run combat-engine combat-gauge combat-kits conduit-effects`
- `npx vitest run`
- `npm run build`
- `npx tsc --project supabase\functions\game-operation\tsconfig.json`
- `node tools\bundle_server_game.mjs`
- `node tools\run_pressure_study.mjs <report.jsonl> --tuned-only`

The pressure runner is the renamed existing tool, not a new preview. Measure unenhanced and optimized teams,
single owned starter through six conditional owned bearers, zero-Defense packet
output separately from actual pressured clear/loss/stalemate behavior, and
shield/cleansing/charge stalls. Do not retune hostiles to conceal weak kits.
Re-run bounded economy comparisons because faster clears can change reward per
request even though no reward formula changes. Preserve historical rewards on
rules restarts; deploy client and authority with compatibility gates.

Pending art: 114 proposed tier treatments may reuse a bearer's own installed
signature icon when honest; new resource/mark/voucher/Lead/Repair/Echo/Aftershock
badges need individually reviewed art. Use exact named text and neutral pending
tiles until delivery. No new PNG path, portrait intake, paid generation or event
launch is authorized. The owner's newest distinctive, attractive adult anime
design direction guides future/Sunshade design work; this mechanical proposal
does not redraw existing characters or copy reference-game characters.

### Owner approval questions (Phase A stop)

1. Approve these 38 complete kit directions and first-pass coefficients for
   measured Phase B implementation, or name sheets to revise first?
2. Approve N1-N10, especially Caevren/Ozriel's **costly, non-guaranteed**
   intercession, Aureth's restricted target guidance and Oryn's targeted Defense?
   N11-N13 remain rejected/deferred unless separately requested.
3. Approve first-stat-only ordinary/Calamitic `leader` gear scaling and the
   explicit fixed/scalable Imbue mapping above, preserving all saved IDs/ranks?
4. Proceed from these original Last Light sheets without the missing 25-example
   attachment, or supply it for an additional comparison before implementation?

No identity, currency, event schedule, summon or drop-rate change is requested.
Approval of an inactive Sunshade kit does not approve launching its event.

## Phase A kit-copy contract (2026-11-11)

Owner requires concise, formulaic player-facing wording throughout the full
38-bearer proposal: every Leader Ability, Passive, each of the three distinct
Flare tiers, and each of the three individually tailored personal Masters.
Use original Last Light names and mechanics, not copied Brave Frontier text.

- Format: **[Ability type]: [Name]** followed by a compact effect list.
- Keep clause order consistent: target/scope, exact effect and value,
  duration, trigger and meaningful limit. Omit inapplicable fields.
- Use consistent terms and notation: Health, Attack, Defense, Recovery,
  personal charge and shared charge; distinguish percentages from percentage
  points. Identify any damage/healing/Shield basis and whose stat it uses.
- State conditions, clocks, stack caps and exceptions when they affect a
  decision. Never replace them with "greatly," "powerful" or similar vague copy.
- Give each Flare tier its own complete concise line; do not make readers
  reconstruct Lustrous or Eternal by combining earlier tiers.
- Keep detailed ordering, stacking, ownership and engine interactions in
  adjacent design notes, not padded into player-facing effect lists. Shared
  rules belong in the glossary; genuinely different exceptions stay inline.
- Preserve each Master's individual attunement and enhancement. Concise
  wording does not authorize generic effects or identical kits.

Writing pattern only, not an approved mechanic or balance value:

> **Leader Ability: [Original name]**
> All allies: +20% Health, +15% Attack; personal Flare charge cost -10%.
>
> **Passive: [Original name]**
> After this bearer Defends, grant self a Shield equal to 15% maximum Health
> (once per round; lasts until broken).

Numbers above illustrate copy structure only. Complete exact kit sheets,
interaction notes and owner approval remain required; this wording decision
does not authorize gameplay changes or satisfy the unfinished Phase A sheets.

## Six-member scope and rejected mock-up (2026-11-08)

[Latest expanded contract](combat-system-specification.md#expanded-scope-six-bearer-progression-and-integrated-ui-2026-11-08):
1-6 bearers allowed everywhere; larger squads/gear expected with rising
difficulty, optimized six-member benchmark for Calamity. Audit all enemy
stats/mechanics at current authored levels/gates and all Conduits/Masters.
Rework squad/equipment, necessary Home/Team/Battle UI and cinematic saved full
squad Home art. Previous alternate menu design is rejected/retired; no separate
named presets selected after clarification. No runtime implementation yet.

## Shared compact evolution portraits (2026-11-08)

Owner requests consistently framed face/upper-body portraits derived from
each existing evolution artwork, reused across all compact portrait contexts.
[Contract](combat-system-specification.md#owner-selected-shared-evolution-portraits-2026-11-08)
preserves full art in Team/showcases/field, original bytes, reviewed per-form
framing, facing, provenance/revisions and discovery/unreleased gates.
No exports or runtime wiring completed in this planning update.

## Latest owner charge correction (2026-11-08)

[Layered personal/shared contract](combat-system-specification.md#owner-revision-layered-charge-and-shared-eternal-readiness-2026-11-08)
supersedes single-current-tier replacement and temporary empowerment.
Two personal layers: Glowing at base cost, Lustrous at twice base; retain excess
charge and offer highest ready tier. Evo.4 unlocks the second layer.
Eternal uses a full shared team meter plus both personal layers, final-form
bearers only; shared meter builds/displays only with a final-form squad member.
One cast consumes team charge; others retain personal charge. No third personal
bar, reset/refill mode or timer. Keep unlimited Shields; remove random crit.
Old abilities may be replaced/folded per character rather than forced to survive.
Exact costs/gains/starter/equipment mappings need revision/review before coding.

## Consolidated exact review draft (2026-11-08)

[System and three-starter specification](combat-system-specification.md)
is the next review deliverable: four-stat formulas, subtype values, charge/
empowerment state machine, three complete starter kits, nine existing Master
remaps, Imbue proposal and validation/migration gates. Numerical values are
unmeasured proposals. Review final-form support access, critical remapping,
Shield cap/refresh and paid Imbue conversion before implementation.
The historical audit and owner decisions below remain provenance.

## Master-selected sub-types: owner revision (2026-11-08)

**This replaces fixed innate subtype assignment.** Every Element-Bearer defaults
to **Equinox**. Equipping a compatible personal Master Conduit changes its
sub-type to the Master's declared profile and grants one character-specific
ability enhancement. Changing or removing that Master changes the profile;
no Master means Equinox. No permanent conversion, random Type or reroll.

Use the existing one matching-bearer Master slot and owned-equipment transaction
foundation, not another subtype menu, consumable or progression tree.
The requested subtype vocabulary is Equinox / Corona / Aegis / Solstice / Prism.
Exact stat bonuses/penalties, Master assignments and ability enhancements remain
subject to the system/starter review before implementation.

### Proposed player wording

**"Attunes Tizu to Aegis."** Then list the actual stat changes and the actual
ability enhancement. A generic template is:

> Attunes this Element-Bearer to [sub-type].
> [Exact stat bonuses and penalties.]
> [Named ability]: [exact enhancement, scope, condition and duration].

Do not say "turns into" as though the character's identity, element, rarity or
evolution changes. "Attunement" is the proposed equipment-selected build concept,
not a new combat buff or extra resource. Keep subtype names consistent across
characters; poetic Master names and unique ability effects provide variety.

### Mechanical boundaries for the exact specification

- Equinox provides no subtype bonus/penalty. Baseline characters retain distinct
  authored stats, passive, leader ability and Flare despite sharing Equinox.
- Each Master selects exactly one profile plus one clearly scoped personal
  enhancement. Its subtype modifiers are the Master's stat package, not extra
  bonuses layered over another hidden personal Master stat package.
- Replace old role stat bonuses. Reconcile ordinary gear, Ascension, subtype
  percentages and conditional/leader effects through one documented stat order.
- Prism must use the selected four-stat architecture: **higher Recovery / lower
  Defense** is the proposed replacement for the earlier Skill Power profile.
  Review numbers against real healing; don't retain a hidden fifth core stat.
- One profile at a time; no profile stacks, owned-but-unequipped bonuses or
  permanent residue after switching. No automatic unlock or equipment grant.
- Existing three Master alternatives per character should offer meaningful
  choices among selected profiles/enhancements; not every bearer needs every
  subtype. Present the complete per-Master review table before implementation.
- Clarify an enhancement's behavior across all three evolved Flare versions;
  a final-tier-only effect must say so and remain a deliberate later-game choice.
  No references to removed Skill1/Skill2 buttons.
- Freeze the selected Master, subtype and enhancement in the encounter loadout.
  Settings/resume/Continue never rereads a changed menu Master mid-run.
- Gear switching in menus recomputes previews from base progress, not previously
  modified stats. A temporary maxHP change never heals or revives a battle unit.
- Preserve Master IDs/ownership and reviewed compatibility migration. Captured
  Devourers are not playable/equippable and receive no new subtype system.
- Accepted equipment selection must save before success effects; removal and
  failed/stale saves must not celebrate a change that did not occur.

The master-driven profile is the approved direction; these exact formula,
wording and mapping details are specification proposals, not implemented behavior.

## Implementation questionnaire: owner decisions (2026-11-08)

This section supersedes conflicting earlier recommendations. **Exact system
and three-starter kits require owner approval before implementation**, followed
by reviewed roster batches. No production mechanics change in this planning pass.

### Selected scope

- Replace visible combat stat architecture with **HP, Attack, Defense, Recovery**,
  with explicit old-stat/equipment mappings. Recovery's delivered/received
  healing formula still needs an exact specification.
- Equinox by default; one equipped personal Master selects the mechanical
  sub-type and a character-specific ability enhancement. See the latest owner
  revision above. Percentages/assignments need a **review table before implementation**.
- Normal Attack and Defense remain; only the current evolved Flare is selectable.
- Passive Ability and one first-member Leader Ability remain. Leader effect
  works solo and stops while the leader is defeated; no automatic replacement.
- Owner permits removing DPS/Tank/Support roles to avoid duplication with
  sub-types. Keep a consistent simple architecture, not old role stat/perk
  layers secretly stacked behind the four-stat model.
- Ordinary tiers remain forms1-3 /4-5 /6. Calamitic tiers use **equivalent saved
  forms1-3 /4-5 /6**, despite displayed Evo.2-7. Ascension enhances final tier.
- **Elemental-Devourers are no longer equippable as playable squad members.**
  Preserve capture inventories/fodder unless separately directed; exact legacy
  squad/gear repair, capture UI and future capture rules remain to specify.
- Owner delegates redesign of old skill Imbues/Conduits/Masters rather than
  requiring preserved numerical investment value. Do not infer permission to
  delete owned assets, balances, upgrades or progress. Publish an explicit
  compatibility table with the reviewed specification.
- Partial damage-based Prismatica remains saved on defeat/quit. Fixed per-enemy
  budgets and repeat-entry farming tests remain mandatory; safeguards require
  approval rather than silently forfeiting already-earned currency.
- Flare spectacle is bounded, speed-scaled, skippable and Reduce-motion-aware.
  Real-time Gauge presentation and the selected three Flare names remain.

### Shared/personal charge reference supplied by owner

**Follow-up decisions confirmed2026-11-08:**
- Use the two-step final Flare model: spend full shared charge to empower one
  eligible bearer, empty its personal bar, recharge and cast within **four squad
  rounds**. Subsequent activations in a fight require more team charge.
- **Remove forced next-turn recovery for every Flare tier.** Balance exact
  costs, gain cadence and output; no inherited free power increase.
- Hybrid charge: guaranteed action/round gains plus **capped random bonus motes
  from real attack hits to the attacker**. No random squad allocation, no
  cosmetic-hit rolls and no uncapped multi-hit advantage. Passive/leader/gear
  fill effects remain reviewed. No new consumables or elemental advantage.
- Retain captured copies and fodder, but require **manual bearer squad selection
  before battle** when a legacy squad is invalid. No automatic team repair or
  new bearer grants. Preserve gear ownership/upgrades; define how captured
  equipment is cleared in the compatibility transaction.

The exact guarantee/bonus amounts, chances/caps, timer counting, mode expiry,
death/carryover and escalating shared thresholds require the specification.
Use a dedicated persisted charge RNG stream so cosmetic, combat-critical,
reward and capture randomness are not repurposed. Accepted combat state,
charge rolls and outcomes commit atomically; failure advances none.
Available healthy/non-damaging support actions need useful guaranteed charge
paths so the new model does not force every healer to deal damage.
These decisions resolve the corresponding questions below; the supplied
reference remains explanatory history, not a broader import approval.

Owner selects **personal Gauge plus a shared squad resource for Eternal Radiant
Flare**, and describes the reference's two-step climax: fill team charge,
activate one eligible bearer, empty/recharge its personal bar, then cast within
a four-turn window. Subsequent activations become more expensive.

Translate this into original terminology and shared definitions rather than
copying names, item designs or a proprietary implementation. Candidate team
resource **Concord Gauge**, activation **Radiant Ascendancy** and charge motes
**Lustre Motes** remain proposals, not approved final strings. Combat Ascendancy
is temporary and must be distinguished from permanent Stat Ascension.

The reference also describes per-hit/random crystal drops, elemental advantage,
fill gear, consumables and stacked personal bars. These are not all implicitly
approved as features. Clarify exact two-step behavior, resource sources and
scope before specifying them. The reference's dual lower-tier bar conflicts
with the selected one-current-Flare control model if lower tiers are selectable.
Prefer one current-tier bar unless the owner revises that selection.

The original recovery answer explained charging rather than skipping; the
follow-up above explicitly removes the forced skip for all Flare tiers.
Likewise, a four-turn mode timer requires a clock, expiry rules, death handling,
retry/reset/Continue behavior and accessible confirmation/controls.

Common beneficial stat buffs should follow a simple strongest-wins, no-additive
stacking contract if selected. Exact refresh/duration behavior still matters:
do not let a weak short buff erase a stronger long buff, or imply a single rule
for independent damage-over-time sources and owned Shields.

### Remaining review gates

1. Specify selected two-step climax/timer/escalation with no forced recovery.
2. Specify guaranteed base and capped attacker-only random bonus charge.
   Cosmetic hit counts cannot become mechanical grants.
3. Review fill effects; new items and elemental advantage are out of scope.
4. Specify manual invalid-squad selection and retained capture/fodder inventory.
5. Review four-stat scaling, subtype table and three exact starter kits.
6. Review full gear/Imbue/status/leader rules, currency ledger and save/rules
   migration before a public release.

## Owner-selected direction (2026-11-07, follow-up)

The owner selects a simpler full-roster architecture:

- One **Passive Ability**, one **Leader Ability**, and one evolution-upgraded
  signature active, replacing the previous two-skill-plus-Last-Flare proposal.
- System names and ability language should express **Light and Lustre** while
  preserving each character's element, thematic role and original identity.
- Signature tier1 below ordinary Evo.4, tier2 at Evo.4-5, tier3 at ordinary
  Evo.6 **without Ascension**. Ascension enhances the final version further.
- Actual Prismatica is earned as enemy Health is depleted, from a **fixed
  per-enemy budget**; the unpaid remainder is awarded on defeat.

These selections supersede the conflicting recommendations and open choices
in the original audit below. They approve the design direction, not unreviewed
coefficients, migration policy, resource formulas, copied terminology or an
immediate production release. The all-screen UI mock-up remains paused;
the requested battle layout is part of this new combat specification.

### Selected Flare names and proposed supporting vocabulary

| Layer | Wording | Intended meaning |
| --- | --- | --- |
| Personal passive | Radiant Signature | Automatic character identity; active irrespective of leader position. Display with the plain label "Passive Ability". |
| Leader ability | Luminary Covenant | One explicitly leader-only squad benefit. Display with the plain label "Leader Ability". |
| Tier1 signature | Glowing Flare | Selected name; dependable expression of the character's role. |
| Tier2 signature | Lustrous Flare | Selected name; enhanced version with a meaningful tactical improvement. |
| Tier3 signature | Eternal Radiant Flare | Selected name; final-form climax; Ascension strengthens it. |
| Personal charge | Lustre Gauge | Candidate replacement display name for Elemental Gauge, if personal charge is retained. |

The three Flare tier names are **owner-selected**. Passive/leader/Gauge names
remain proposals. Authored skill names can
remain character-specific within these common categories. Light-themed system
language does not convert Infernic/Oceanic/Botanic/Atmospheric/Tranquilitic/
Chaotic characters into a single combat element.

### Corrected sub-type contract: innate stat profiles (owner clarification)

Owner clarifies that sub-types mean **mechanical stat strengths and trade-offs**,
like higher Attack/lower Health, not unique poetic tactical labels alone.
Owner initially selected **fixed assignment by character identity and combat role** and
**replacement of current role stat bonuses** with the new profiles. Existing
Tank targeting and Support role healing need separate review; neither is
implicitly removed or retained.

The later Master-selected revision above supersedes fixed assignment: players
change profiles through equipment. No random acquisition Type, reroll or lottery.
The individual Discipline titles below are historical tactical-name proposals,
not the selected mechanical subtype system. They may remain optional identity
descriptors only if useful; no extra modifier layer is implied.

| Proposed subtype | Innate stat direction | Intended use |
| --- | --- | --- |
| Corona | Higher Direct Attack, lower Health | Aggressive damage dealer. |
| Aegis | Higher Defense, lower Direct Attack | Defensive protector. |
| Solstice | Higher Health, lower Direct Attack | Endurance specialist. |
| Prism | Higher Skill Power, lower Defense | Ability-focused attacker or support. |
| Equinox | Balanced stats, no bonus or penalty | Generalist. |

These names, profile count and directions are proposals; no numerical
coefficients or per-character assignments are approved yet. Test each profile
against actual native stats, skills, level growth and gear before fixing values.
An increased Attack stat need not offset reduced HP in value or survival.
Avoid multiplying current Attacker/Tank/Support stat bonuses by these modifiers.
Document the shared raw-stat pool, scaling order and menu/battle parity.
Stat penalties must preserve viable solo starters and useful support identities.
The later bearer-only squad decision removes captured subtype assignment.

**Naming rule:** light-themed terminology should be varied across unrelated
systems, but direct advancements may share a coherent wording family.
Do not invent a new unrelated noun for each evolved version of the same idea.
Glowing Flare / Lustrous Flare / Eternal Radiant Flare stay owner-selected.
No evolving subtype bonuses or new subtype tiers are implied by this rule.

The previous broad implementation questionnaire was interrupted. None of its
defaults constitutes approval; charge, recovery, controls/stats, leader death,
Calamitic/captured mapping and investment policy still need decisions.

### Historical tactical labels: proposed Radiant Disciplines

The initial interpretation proposed unique tactical labels and light-themed systems/philosophy
without repetitive "Light this / Light that" naming. **Radiant Discipline** is
the proposed name for a fixed tactical sub-type beneath the familiar role.
The owner requests the draft; the individual names and mechanics below remain
proposals pending review.

Keep distinct layers:
- **Element:** existing canonical elemental identity; unchanged.
- **Role:** readable Attacker, Tank or Support classification.
- **Discipline:** what makes this character's approach distinctive.
- **Radiant Signature:** its personal passive, not another separate passive slot.
- **Luminary Covenant:** its leader ability, not an additional equipment aura.
- **Flare:** its single evolution-upgraded active.

Disciplines are not random Types, growth modifiers, rarity ranks or another
unlock tree. A summon cannot roll a worse Discipline. No new RNG, saved subtype
field, equipment restriction or matching bonus is proposed. Each character's
catalog identity determines the label, which remains through evolution.
Roles and exact perks must be reconciled in the kit specification; a Discipline
does not automatically award new bonuses.

The plain-English tactical explanation must accompany the poetic name.
For example: **Tizu — Tank / Tideglass Custodian: shields allies against direct
pressure.** Do not replace useful role/status/cost labels with unexplained lore.

| Character | Proposed unique Discipline | Tactical identity to preserve in the single-active redesign |
| --- | --- | --- |
| Infernis | Cinderwake Vanguard | Offensive Burn pressure; a deliberate detonation payoff, not multiple ember counters. |
| Tizu | Tideglass Custodian | Chosen-ally barrier protection with useful solo defense. |
| Flora | Dawnseed Tender | Delayed healing that blossoms into timely recovery. |
| Atmoso | Halozephyr Conductor | A gathering wind formation and a readable release. |
| Elise | Fulgar Prismblade | Placed twin blades converge in a focused recall strike. |
| Bliss | Opaline Virtuoso | Graceful action-order support woven into offense. |
| Bruno | Ambermantle Bastion | Deliberately intercept damage intended for allies. |
| Disciple | Mindstar Preceptor | Prepare an ally's next action for a clear damage or support payoff. |
| Aurora | Horizon Augur | Forecast dangerous enemy skills and blunt their arrival. |
| Razor | Eclipse Reprisal | Survive direct pressure and return stored Wounds as revenge. |
| Rosetta | Aureole Huntress | Coordinate the squad against one designated quarry. |
| Thornia | Gloamthorn Sentinel | Punish enemy actions through a visible retaliatory trap. |
| Crinso | Twinflare Duelist | Preserve opposed-edge combo identity through passive/Normal/Flare interplay; do not require two removed skill buttons. |
| Nerithe | Meridian Pathfinder | Survey a target with Normal Attacks, then exploit its defenses. |
| Orvella | Facetbed Architect | Maintain a finite shared Foundation and convert its durability deliberately. |
| Vaelor | Zenith Resonator | A readable rhythmic window for enhanced attacks. |
| Ozriel | Cathedral Aegis | Emergency squad survival and powerful shielding, not automatic revival. |
| Ilvaris | Starveil Cantor | Mark a priority enemy while sustaining the squad. |
| Kaelith | Fracture Seraph | Build a bounded incision and release a precise rupture. |
| Caldrex | Kilnstar Bulwark | Bank hostile pressure to fortify the squad or discharge Heat. |
| Solenne | Vesperbell Warden | Spend finite Stillness carefully between defense and retaliation. |
| Myrthen | Solstice Reaper | One seasonal cycle culminating in a Harvest window. |
| Neralis | Afterglow Ferryman | Build Current through useful actions and rescue wounded allies. |
| Varkhel | Faultsun Anchor | Hold enemy pressure, then release a piercing Tension payoff. |
| Seravelle | Emberchorus Herald | Reward coordinated squad Normal Attacks with convoy momentum. |
| Velmira | Parallax Fencer | Alternating attack cadence and precision piercing; distinguish it from Crinso's combo climax. |
| Maerion | Moonwake Reclaimer | Gather actual lost Health into a clearly bounded recovery pool. |
| Caevren | Penumbral Loadbearer | Intercept for allies and turn carried pressure into protection; explicitly differentiate from Bruno. |
| Vespera | Beacon Cantor | Signal an ally and convert cooperation into an offensive support payoff. |
| Ilyss | Argent Absolver | Cleanse harmful effects and restore allies without prerequisite stacks. |
| Asteriel | Moonflower Paragon | Choose a protective or offensive support path with one visible state. |
| Serapha | Eventide Arbiter | Use weakening to create a predictable protective window. |

These32 entries cover the released roster, not the hidden six Sunshade bearers.
Before final kit approval, verify each remaining owned mechanic against current
runtime and map its investments. In particular, alternating-skill identities
must be genuinely redesigned around the selected single active, not left with
an impossible two-skill prerequisite.

Captured Elemental-Devourers remain legal mixed-team members. Their subtype
policy needs a separate fixed-family design, not32 copied bearer labels or
automatic new abilities. Do not remove existing captured actions/ownership
without a reviewed parity and migration contract.

### Radiant design philosophy and vocabulary discipline

| Principle | Design meaning / acceptance consequence |
| --- | --- |
| Lucidity | Every poetic label has a clear tactical explanation; target, cost, effect and duration remain literal. |
| Refraction | One shared system expresses many elemental identities; no universal gold recolor or copied kit. |
| Convergence | Passive, leader ability and Flare reinforce one identifiable play pattern without recursive trigger chains. |
| Resonance | Squad cooperation creates deliberate choices, not mandatory rare-character ownership or subtype-matching bonuses. |
| Radiance | Each Flare tier escalates silhouette, choreography and impact; power and clarity are not replaced by particle density. |
| Afterglow | Finite effects settle into readable exact outcomes; no lingering glare obscures controls or repeats a saved grant. |
| Continuity | Evolution deepens the same Discipline and preserves ownership, art and mapped investments. |

Use related words deliberately: lustre, aureole, facet, prism, halo, dawn,
zenith, glimmer, eclipse, corona, refraction and afterglow. Darker radiant terms
belong to moon/night/Chaotic identities, not a newly introduced combat element.
Do not rename Health, Defense, Burn, Weaken, costs or currency just to make
every noun poetic. Existing Prismatica/Null-Prismatica terminology stays.
Reserve "Eternal" for the selected final Flare category rather than every title.
No new shared resource or mechanic is implied by naming a design principle.

### Revised functional model

Preserve Normal Attack as a free, dependable baseline in the proposed design.
The owner selected one signature active, not a new skill button for each tier:
evolution replaces its current version. Whether lower versions remain manually
selectable is not approved. Defense and target controls need an explicit
retained/removed decision in the complete input specification.

Each signature must function as an attacker, tank or support action as
appropriate. "Attack ability" must not force every healer to become a damage
dealer. Exact targeting, Gauge spend/gain, recovery, leader-death behavior,
passive/role-perk consolidation and captured-unit parity remain to be specified.
No additional shared Overdrive-like resource is selected by this follow-up.

Ordinary Evo.1-3/4-5/6 gates are selected. Calamitic characters display Evo.2-7
from six saved forms: recommend equivalent form gates, with the final tier at
their Calamitic final form, but obtain an explicit mapping before coding.
Current stat Ascension and three separate25-Shard Imbues cannot simply be
discarded or combined for free. Provide an approved mapping for all invested
Skill1, Skill2 and Last Flare enhancements and their equipment references.

### Damage-based currency contract to specify

Keep each enemy's existing total currency distribution and activity exceptions.
Resolve its budget once using the authority's reward stream; never reroll on
each hit. Paying earlier changes when the reward stream is consumed, so this
must be reviewed and versioned rather than described as an unchanged RNG path.

Recommended integer payout model for budget `B` and maximum Health `H`:

1. Track the lowest actual Health reached, `L`, initially `H`.
2. Earned total is `floor(B * (H - L) / H)` using safe exact arithmetic.
3. Pay only earned total minus the already-paid amount.
4. On defeat, pay exactly the remaining budget once.

Only actual Health depletion advances entitlement; damage numbers, overkill,
Shield absorption, animation hit counts and repeat damage after enemy healing
cannot expand the budget. An enemy with no eligible budget pays nothing.
Ordinary damage and periodic effects need an explicit common eligibility rule;
the recommended shared Health-depletion ledger avoids packet-count advantages.
Enemy maxHP changes, scripted transformations and reinforcements require
well-defined budget/Health baselines rather than resetting payout eligibility.

All HP changes, payout-ledger changes, currency, reward-stream advances and
other resolved outcomes save atomically through the accepted combat operation.
On failure, none advance and no effect claims earned currency. Existing
kill-only materials, captures, discoveries, premiums and first-clear bonuses
remain kill-only unless separately approved. No extra reward on visual pickup.
The final kill receipt must exclude currency already paid during combat.

Defeat/quit retains already-saved currency; Retry creates a new encounter budget.
This intentionally permits partial-encounter earnings. Before release, compare
damage-and-quit farming against normal clears, especially Treasury, long bosses
and repeated entry, without silently adding entry costs or forfeiting earnings.
Separate prospective pacing decisions from preserving original per-enemy totals.

### Requested battle presentation

- Portrait-based squad controls beneath the arena, using existing artwork.
- Visible HP/charge and compact ally buffs/debuffs with accessible full details.
- Text commands for the signature active; no dedicated new ability icons.
- Reuse existing status icons where semantics match. Historical ability art
  may become a status asset only after per-icon meaning/readability review.
- Standard descriptions: target, exact effect/value, condition, duration and
  real cost/consequence. Do not hide multipliers behind "powerful" or "massive".
- Distinguish real mechanically counted hits from cosmetic VFX. Neither grants
  new crystals/resources without an approved mechanic.
- Preserve current three-member formation, keyboard/focus, impact-ledger timing,
  existing scenery, finite VFX and static Reduce motion feedback.

### Next deliverable

Create an exact original-system specification and starter kit examples for
review, then a full-roster plan and equipment/investment mapping. Update the
pilot to compare the old four-action structure with the selected single-active
structure, not merely rename the current skills. No live rework is implemented
by this document update.

### Owner-selected live Gauge feedback and enhanced Flare VFX

Owner additionally requires Gauge to visibly increase during attack
presentation, rather than snapping to its final value after the sequence, and
substantially stronger signature animation with enhanced shaders and VFX.
This is a new combat-presentation acceptance requirement, not completed work.

**Impact-timed Gauge ledger:**
- Present the accepted action's ordered, actual Gauge events at their relevant
  attack impacts/trigger beats alongside HP, Shield and status updates.
- Start from pre-action Gauge; include spend, refunds, incoming-hit gains and
  other genuine source events; finish at the exact authoritative value.
- Do not increase at every cosmetic strike unless that strike has a real
  corresponding grant. Multi-hit/AoE animations must not multiply resources.
- A short eased fill may connect the exact values; affordability still follows
  engine action availability, never the interpolated bar or particles.
- Gain and spend remain legible even within one sequence. Show caps/overflow
  honestly, including grants that cannot fit; don't imply extra stored charge.
- Skip reaches the exact final ledger; Settings/resume, battle speed changes
  and disposal never replay a grant or duplicate a transaction.
- Under Reduce motion, update values at the same logical beats without
  traveling particles, pulsing blooms or animated fills.

**Proposed radiant escalation:**

| Tier | Proposed presentation character |
| --- | --- |
| Glowing Flare | Distinct elemental charge, luminous core, readable attack trail, concentrated impact bloom and a finite dispersal. |
| Lustrous Flare | Layered refractive trails, shaped light geometry, richer secondary impacts, broader bloom and a character-specific field response. |
| Eternal Radiant Flare | Signature elemental light architecture, shader-enhanced radiance/distortion, layered rays and a multi-beat climax with a clear final impact and dissipation. |
| Ascended enhancement | Refine and intensify the final tier's established motif, not another unapproved tier or permanent full-screen glare. |

All characters need distinct motion/silhouettes and elemental expression, not
the same particle explosion recolored. Tank/healing Flare VFX express protection
and restoration; new damage is not added to justify spectacle.
Reuse installed portraits/scenery and existing VFX/impact/cut-in foundations,
including [battle effects](../../src/presentation/battle-effects.ts) and
[cut-ins](../../src/presentation/battle-cutin.ts), before introducing another
renderer. Evaluate GPU bloom, distortion and light-ray passes against the
existing rendering lifecycle; no engine change is selected.

Preserve authored artwork/facing and keep portrait controls, HP/Gauge, statuses
and action text readable above effects. Use finite pointer-transparent overlays.
Do not achieve intensity through rapid full-screen flashes/strobing, sustained
whiteouts or mandatory camera shake. Keep explicit in-game Reduce motion,
immediate Skip where supported, playback-speed scaling and complete cleanup.
Cosmetic randomness stays separate from gameplay/reward RNG. No new delay to
reward persistence or artificial transaction wait.

**Required validation before declaring this delivered:**
- Sample pre-impact/impact/post-impact/final Gauge against ordered real events,
  including spend+refund, capped gains, AoE, periodic and defensive triggers.
- Observe all three tiers over time, not just screenshots; verify distinct
  charge, readable impact and dissipation.
- Profile sustained and repeated Flare casts on a declared mid-range laptop;
  target60fps with bounded particle/overdraw/GPU cost, adaptive quality and no
  growing memory/listener counts. Record actual measurements, not a guarantee.
- Exercise reduced motion, low-quality/GPU fallback, unsupported shaders,
  Skip,1x/2x/3x, Settings interruption and repeated disposal.
- The strongest tier must remain visually impressive at reduced quality,
  without covering actionable/readable battle information.

## Status and decision boundary

Original audit requested2026-11-07. **The original recommendations below are
historical where superseded by the owner-selected direction above. No exact
kit, stat, Gauge, equipment, progression or save migration is approved here.**
Audited against implementation release `d82015ba` and its rules18 authority.
The paused UI redesign and Story work remain paused.

The Brave Frontier description and screenshot supplied by the owner are a
reference for understandable combat layers and presentation priorities, not
an independently verified history of every version of that game. Use general
design principles; do not copy its characters, artwork, skill names, terminology,
logos, prose, exact kits or proprietary implementation.

**Core finding:** Last Light already has a comparable special-attack skeleton.
Its largest readability problem is not the number of skill buttons. It is the
number of interacting rules behind each choice: personal state, role perks,
equipment exceptions, variable Gauge, packet scaling and different clocks.
Adding every reference system on top would make that problem worse.

**Recommended direction:** keep character identities and the three-member
formation; standardize the combat grammar; make each character understandable
as one role, one personal hook and a clear basic/core/advanced/climax choice.
Prototype a shared climax resource only after the simpler baseline is measured.
Do not launch random summon Types, Recovery, skill-level grinding and a new
enhancement tree simultaneously.

## 1. What actually exists

Primary evidence is runtime code, not older retained specification paragraphs:

- [Stats and fighter resolution](../../src/content/combat.ts),
  [current stat labels/defaults](../../src/content/phase-zero-stats.ts).
- [Current native identities](../../src/content/native-identities.ts),
  [seasonal identities](../../src/content/moon-sunshade-native-identities.ts),
  [native runtime](../../src/game/native-kits.ts).
- [Actions, turns and recovery](../../src/game/battle.ts),
  [Gauge, effects and equipment integration](../../src/game/conduit-runtime.ts).
- [Intrinsic roles](../../src/content/role-perks.ts),
  [Masters](../../src/content/master-conduits.ts),
  [ordinary Conduits](../../src/content/conduits.ts).
- [Progression](../../src/content/progression.ts),
  [captured instances](../../src/game/character-instances.ts),
  [atomic account transactions](../../src/game/account.ts),
  [authority](../../supabase/functions/game-operation/engine.ts).

### Current structure

| Layer | Implemented behavior | Important distinction |
| --- | --- | --- |
| Roster |38 authored bearers:32 released identities plus six unreleased Sunshade identities | Sunshade must remain hidden; being defined internally does not make it acquirable. |
| Squad |1-3 owned distinct instances, mixed bearers/Devourers, leader first | Only one starter is free. A tested trio is conditional on ownership. |
| Main stats | Health, Direct Attack, Defense | No Recovery stat or Heart Crystal system exists. |
| Advanced stats | Critical Rate, Critical Damage Multiplier, Skill Power, Skill Duration, Skill Efficiency, Elemental Gauge Capacity, Elemental Gauge Gain | Ten current labeled stat keys total, not just the historical seven-field model. Internal fields are not all current player-facing mechanics. |
| Actions | Normal Attack, Skill1, Skill2, Last Flare | All three actives are defined for base-form bearers; captured forms may lack some slots. |
| Personal Gauge | Starts0; base capacity100; Normal Attack offers20, incoming direct hits offer10 | Effective gains/capacity depend on progress, gear and native rules. |
| Base spend | Normal0, Skill1=25, Skill2=40, Last Flare=100 | Equipment/Skill Efficiency can alter costs; these are not universal effective prices. |
| Last Flare | A powerful third active; normally skips the caster's next player turn | Recovery and ready-round/equipment exceptions are part of its price. |
| Personal passive | Each bearer has an automatic native identity | Some passives affect allies, but they are not leader-only skills. |
| Role perk | Tank: Defense/targeting; Attacker: Direct Attack/Skill Power; Support: Health/Skill Power and4% squad healing after skills | Fixed by character identity, not a randomized summon Type. Role healing is a separate source from the named skill. |
| Equipment | Eight ordinary slots plus one matching personal Master; three Master alternatives per authored bearer | Masters overlap the customization role of extra passives/enhancements; they are owned equipment, not an SP tree. |
| High-end progression | Evolution, leveling, stat Ascension and three ability Imbues |25-Shard steps; no BB-level10 unlock or free-form skill tree. |
| Leader | First member drives composition/identity and relevant presentation | No dedicated leader-skill layer, guest mercenary slot or squad Overdrive resource found in the inspected implementation. |

The live native identity replaces historical skill/passive text. For example,
Tizu is now a targeted barrier protector, not the older fixed-shield/AoE-damage
kit; Flora uses Seeds, not the old shared Bloom-charge kit. Designing against
the obsolete tables would produce a second inconsistent rework.

### Gauge example: why capacity is not the same as readiness

At base stats, five Normal Attacks offer100 Gauge. Spending25 after two
Normals leaves15, not a partially upgraded stronger skill. Skill1 and Skill2
are independent tactical moves, not automatically BB and SBB tiers of one move.
Capacity increases with character potency and equipment, while the base Last
Flare spend remains100 before modifiers. A visually full bar therefore need
not mean "this is the first instant Last Flare became affordable."

Healing, taunt, shields, incoming hits and Gauge gear can change the cadence.
There are no mechanically collectible Battle Crystals today. Reward pickup
animation is not combat-resource collection.

## 2. Comparison with the owner's reference

| Reference concept | Last Light analogue | Gap | Recommendation |
| --- | --- | --- | --- |
| HP / ATK / DEF | Health / Direct Attack / Defense | Names are longer; advanced layers obscure the core | Present the three core stats first; retain advanced values in a clear secondary reference. |
| REC | Skill Power and current healing rules cover part of its design space | Healing often depends on recipient maxHP, source Skill Power and effect-specific rules | Test a Recovery model separately; do not add it merely to reach four stats. |
| Random Type | Fixed Tank/Attacker/Support role | No random growth identity per summon | Prefer chosen, reversible specializations later; avoid reroll pressure. |
| Leader Skill | First squad position, plus some always-on squad effects | No exclusive leader passive | Add a small, explicit leader bonus as a later independent pilot, not a complete role rewrite. |
| Extra Skill | Personal passive and personal Master effect | Identity already exists; gear adds substantial complexity | Keep a simple innate passive; let one equipped Master provide the advanced build direction. |
| BB | Skill1 | Skill1 is not always offensive and may participate in a complex loop | A character's dependable core technique, not a compulsory damage button. |
| SBB | Skill2 | Often a different utility move, not a stronger Skill1 | Advanced technique with a clear situational purpose; never force all supports into attack ladders. |
| UBB / OD | Last Flare | Personal Gauge plus recovery, no team OD | Compare current individual climax against a replacement team resource in an isolated prototype. |
| SP | Master alternatives and Ascension/Imbues | Already two investment systems; no point allocation | Use Master choices first. A separate tree is lower priority and must replace overlap, not stack on it. |
| Crystal drops | Deterministic action/incoming-hit Gauge | No BC/HC distribution decisions | Cosmetic wisps can communicate actual resolved gains; do not turn them into a second collection transaction. |

The reference's advantage is a recognizable vocabulary and repeated decision
pattern, not proof that every historic subsystem is beginner-friendly.
The screenshot's unit cards, visible HP/Gauge and central climax bar suggest
information priority. Its dense battlefield and six-unit layout are not a
requirement to enlarge this game's squad or restart the paused UI overhaul.

## 3. Complexity and enjoyment audit

Severity here means design risk, not a proven gameplay defect. No player
telemetry or fresh population playtest was collected in this audit.

| Finding | Evidence | Risk | Recommended response |
| --- | --- | --- | --- |
| Multiplicative rule burden | Personal passive + role perk + eight Conduits + Master + advanced stats | High: players cannot predict what their chosen action actually does | Standardize triggers/scaling and isolate one advanced build hook. |
| Similar-looking actions, different meanings | Two25/40-cost skills can mean attack, stored-state spend, trap, cleanse, cover or stance | High: learning a new character means learning a new grammar | Consistent effect order and clear role labels, while preserving utility choice. |
| Multiple clocks | Player turns, enemy phases, next action, per hit, per owner and encounter resets | High: wrong timing is hard to diagnose | Use one shared duration convention wherever mechanics permit; name exceptions explicitly. |
| Layered amplification | Direct Attack, Skill Power, crit, pierce, native modifiers, role bonuses and gear | High: large numbers mask whether a synergy is skillful or accidental | Measure packet paths; provide a compact action-preview explanation. |
| Recovery + Gauge + conditional resources | Last Flare spend and next-turn skip; bespoke prerequisites | High: a climax can feel like lost agency | Test cost alternatives, rather than removing recovery and keeping power unchanged. |
| Unbounded shield accumulation | Shields persist until broken and repeated casts stack | High: stall/snowball tuning and complex ownership receipts | Compare bounded/refresh alternatives in a simulation; do not silently change the current owner-approved rule. |
| Passive role healing outside the skill | Support skills also heal4% maxHP per living ally | Medium: skill text may not match perceived output | Attribute role contribution separately; retain or fold it into a future role contract deliberately. |
| Random Type addition | Would add another acquisition-quality variable | High: duplicate disappointment and optimization pressure | Not recommended for first refresh. |
| Duplicate customization systems | A new ES unlock/SP tree on top of Masters/Imbues | High: more menus and mandatory chores | Choose one build-choice owner before adding any tree. |
| Progression rewards versus ability access | Expensive evolutions now consume protected Devourers | High: hiding essential healing until later can make starters nonviable | Keep basic role functionality at base form; evolution improves mastery, not permission to function. |
| Rarity versus stars | Acquisition stars are separate from evolving rarity | Medium: a6-star base is not automatically Omnic | If unlocks are introduced, use evolution explicitly, never assumed star mappings. |

### Proposed combat grammar

Every short ability explanation should answer, in this order:

1. **Target:** one enemy, all enemies, one ally or all living allies.
2. **Immediate effect:** damage, healing, shielding or a named buff/debuff.
3. **One signature interaction:** a bonus from the character's personal hook.
4. **Cost and consequence:** Gauge, duration and recovery when relevant.

Shared glossary entries own Burn, Weaken, Shield, cleanse, taunt and intercept.
Do not repeat implementation provenance in every sentence. Exact source,
stacking and clock rules remain available in the detailed reference.
Do not hide information that is necessary to select a target or judge survival.

**Proposed budgets, subject to review:**
- One visible personal resource/state per character, beyond HP/Gauge.
- One primary job and one secondary utility job.
- One setup/payoff interaction per ordinary skill; a climax may summarize the hook.
- No more than three effect clauses in the short description.
- A fully functional zero-stack/no-mark outcome, unless setup is the explicit
  purpose of the move and the interface says so before selection.
- At most one special exception exposed by the selected Master in the core loop.
- A new character should not require reading unrelated characters' kits to act.

These are design targets, not a reason to erase source ownership or genuine
combat safety rules from the engine.

## 4. Roster disposition: preserve identity, reduce rules

This table is a first-pass design audit of all32 released identities. It is not
a replacement numeric kit specification. "Risk" describes cognitive burden,
not strength, rarity or a clear-rate ranking. Older identities receive the same
clarity goals as Moon/War; no universal buff is proposed.

| Character | Keep as recognizable hook | Complexity risk / proposed simplification |
| --- | --- | --- |
| Infernis | Apply Burn, choose when to detonate | Medium: one Burn ownership rule; show remaining detonatable damage, not another counter. |
| Tizu | Protect one ally, stronger team barrier | Medium: unify block-to-Gauge wording; basic protection must work when solo. |
| Flora | Plant delayed healing, harvest when needed | Medium: one Seed state per target; remove unnecessary normal/empowered timing exceptions from the core move. |
| Atmoso | Build a Cyclone, release early or wait | High: display one charge/timer; define one release trigger, no competing automatic/skill-reset surprises. |
| Elise | Place and recall two shuriken | High: visual held/lodged state; one recall rule, optional convergence payoff. |
| Bliss | Reward thoughtful action order | High: reduce opening/passing/closing branches to one clearly signaled timing bonus. |
| Bruno | Intercept damage for another ally | Medium: shared intercept contract and explicit solo fallback; one-step prediction of transferred damage. |
| Disciple | Empower an ally's next action | High: one Empower buff with a readable damage/support result rather than three names for nearly one intention. |
| Aurora | Anticipate and suppress dangerous enemy skills | Medium: show forecasts in battle itself; consistent skill-suppression behavior, no normal-attack ambiguity. |
| Razor | Endure hits, turn Wounds into revenge | High: bounded visible stored amount; simplify which losses count; avoid a tank who needs unsafe HP loss to function. |
| Rosetta | Coordinate attacks on a marked target | High: one focus mark and a single squad-completion payoff; no repeated per-hit contributor grants. |
| Thornia | Set a retaliating thorn trap | Medium: one trap state; normal/empowered distinction should be recognizable without reading damage values. |
| Crinso | Alternate edges to earn a finisher | High: cap visible combo; repeating a move should lose a bonus, not obscure core functionality. |
| Nerithe | Survey with Normal Attack, pierce with skills | Medium: preserve fixed Normal-only bonus; one survey target and clear spend rule. |
| Orvella | Establish a defensive Foundation | High: unify its finite protection/payoff explanation; avoid multiple independent foundation clocks. |
| Vaelor | Time attacks with a three-step Beat | High: passive advances without action; show the next Beat, or test an action-driven rhythm. |
| Ozriel | Team shields and once-per-encounter lethal protection | Medium: preserve survival-not-revival distinction; don't split essential protection across new meters. |
| Ilvaris | Mark enemies and support allies | High: Mark plus Hymn plus stat amplification; choose one signature mark hook and simpler support buff. |
| Kaelith | Build incisions, spend on a focused strike | Medium: distinguish pre-hit stacks from newly earned stacks; cap and communicate the spend. |
| Caldrex | Bank Heat from pressure, defend or discharge | Medium: one Heat gain/spend rule; shared taunt and shielding semantics. |
| Solenne | Hold charges that soften hits | High: defensive charges also power offense; make the risk of spending all clearly predictable. |
| Myrthen | Seasonal build-up and Harvest payoff | High: phase and mark both demand tracking; keep a single season indicator with a clear empowered next move. |
| Neralis | Attack/heal to build Current, rescue the team | Medium: earning back a stack after spend is unintuitive; prototype spend-before-earn with an explicit post-action result. |
| Varkhel | Build Tension through tanking, release it | Medium: unify personal versus redirected hits; Master refund must not obscure recovery cost. |
| Seravelle | Squad Normal Attacks build team momentum | Medium: one per-round contribution cue; isolate Gauge donation from the spend loop. |
| Velmira | Alternate attacks, build Crosscut | High: overlaps Crinso; retain a different tactical payoff, not just different reset rules. |
| Maerion | Recover allies' lost Health through Unreturned | High: borrowed HP amount plus exclusions; one stored recovery pool and clear chosen/team spend. |
| Caevren | Intercept damage and build Load | High: overlaps Bruno/Caldrex/Varkhel; distinguish an intercept specialist without another generic tank stack loop. |
| Vespera | Signal an ally, earn a team-offense payoff | High: Signal plus Beacon plus next-damaging-skill expiry; simplify to one linked setup/payoff state. |
| Ilyss | Cleanse and heal | Medium: cleanse should work without Severance; explicit choice only when both harmful effects exist. |
| Asteriel | Choose protection or offensive support | High: two paths + Promise + Moonflower; preserve stance choice, fold the bonus into one path indicator. |
| Serapha | Create safe windows through weakening | High: Weaken ownership + Interval + Ceasefire; one protective-window hook instead of three counters. |

Unreleased Sunshade's six authored kits also need this grammar audit before a
future release, but remain internal. Do not reveal their identities in live
menus, produce acquisition guidance or interpret this plan as launch approval.
Captured Devourers need a separate limited-kit audit: preserve fixed forms,
owned UUIDs and unavailable skills; never invent a missing active slot.

### Differentiation priorities

The tank cluster should represent different readable jobs, not "gain a stack,
spend it on a shield" eight times:
- Tizu: direct barrier protection.
- Bruno/Caevren: single-ally versus team interception, with a deliberate
  differentiator agreed before replacement.
- Caldrex/Varkhel: team defense versus retaliation; avoid duplicate stack loops.
- Solenne: timing of finite defensive charges.
- Ozriel: emergency lethal protection, not automatic revival.

Likewise, Crinso/Velmira, Flora/Neralis/Maerion/Ilyss/Serapha, and
Disciple/Vespera/Asteriel need distinct tactical purposes. Simplification
should reduce rule differences while increasing meaningful role differences.

## 5. Recommended system architecture

### A. Stats: simple front, complete reference

**First pilot:** keep current math. Core row = HP / Attack / Defense; advanced
row = crit, Skill Power and Gauge properties. Use consistent visible names,
but keep saved/internal IDs stable. Do not recalculate stats to fit the labels.
Any actual presentation implementation waits for an approved bounded scope;
this is not permission to resume the all-screen redesign.

**Optional Recovery experiment:** if the owner specifically wants a fourth
main stat, compare:
- Source Recovery increases healing delivered, while recipient Health remains
  the basis for survival and missing-HP caps.
- Recipient Recovery increases healing received, affecting many balance paths
  and potentially making tank/healer synergies harder to understand.

Source Recovery is the clearer candidate, but it overlaps existing Skill Power
for healing. Before adoption, decide which stat owns healing, what shields use,
how Seeds/Unreturned/role healing/Conduit healing scale, and how every old healing
investment maps. Never multiply old healing by both full Skill Power and a new
Recovery bonus without an explicit rebalance. No coefficients are approved.

### B. Abilities: consistent layers without stripping utility

**Recommended first model:**

| Action | Purpose | Availability proposal |
| --- | --- | --- |
| Normal Attack | Free dependable action and Gauge building | Always. |
| Core Technique (Skill1) | Character's essential role action | Base form; healing/protection need not deal damage. |
| Advanced Technique (Skill2) | Alternative utility or signature payoff | Keep currently owned access; future unlock policy requires separate approval. |
| Last Flare | Character's climactic role expression | Existing access preserved in the first pilot; cost model tested separately. |

"Core" and "Advanced" describe function, not proposed literal in-game names.
Keep the actual authored ability names and artwork. Do not force Skill2 to be
a strict stronger version of Skill1: that removes target/utility choices and
can make optimal play simply "always press the highest affordable tier."

Compare a strict upgrade ladder only for attack-focused pilot characters.
Measure whether it improves understanding enough to justify removing a move.
No fifth action, healing crystal mechanic or three nested charge bars in phase1.

### C. Gauge: first make the existing bar understandable

Before a team resource:
- Clearly show each move's actual affordable threshold and cost.
- Separate stored Gauge from maximum capacity; use percentage and exact values
  consistently in tooltips, refunds and UI.
- Compare fixed100-cost versus capacity-relative Last Flare as different
  experiments. Normalizing percentages changes capacity gear's value.
- Record gains from Normal, incoming hit, personal passive and gear separately.
- Skills/refunds must not create recursive action/Gauge loops.
- No visual particle count or cosmetic collision controls the actual grant.

**Climax experiment, not initial rollout:** prototype one shared squad resource
that replaces Last Flare's personal-Gauge spend rather than adding a second
cost on top. Personal Gauge still pays for the two techniques.

Candidate shape: actions by living squad members contribute a bounded fraction
of one complete squad round; compare readiness after4/6/8 equivalent rounds.
Normalize for legal1/2/3-member squads and define falling-member behavior.
This is a measurement design, not a selected formula. Exclude generated hits,
Burn ticks, animation hit counts, purchases and damage magnitude from earning
the resource. Otherwise multi-hit/AoE/gear outliers dominate fill.

Only one bearer uses the shared climax opportunity; choosing healer, protector
or attacker makes the squad decision meaningful. No simultaneous automatic
three-Last-Flare chain. Prototype these alternatives separately:
1. Personal cost plus current recovery: baseline.
2. Team cost plus current recovery: tests resource change alone.
3. Team cost with no next-turn skip but reduced output/other measured limit:
   tests more immediate agency, not a free power increase.

Decide starting/reset/carryover rules for stages, retry, Settings, defeat and
final-stage replay. A support climax must compete fairly with damage.
Do not adopt75-100% universal mitigation or revival just because the reference
listed it: these can negate authored danger and compound existing shields.

### D. Leader bonus: later, small and legible

Add at most one always-on squad bonus from the first member; no friend-slot
stacking or second leader. Make it work with a solo starter and mixed squads.
Candidate categories: durable protection, steady offense or reliable healing.
Prefer one understandable benefit over element-restricted collections of buffs.
No numbers selected; benchmark against existing role/Master auras first.

Keep personal passives on every member. Define whether the leader bonus stops
on death and how replacements/reordering affect a frozen run. New leaders
cannot be selected mid-battle from current menu state.
No ally revives/heals when a maxHP aura appears. If captured leaders are legal,
they need an explicit usable leader contract, not an accidental disadvantage.

### E. Types and enhancements: not first

**Random Types: defer/reject for the first refresh.** Roles already provide
identity. A bad random defensive roll would be especially unwelcome after
expensive summons and the newly increased material/fodder investments.

If specialization is later desired, offer a manually chosen reversible
orientation with no paid rerolls, random permanent penalties or duplicate-only
unlock. Preserve a balanced default on legacy accounts without load writes.

**Enhancement tree: defer.** Masters already offer three character-specific
directions, and Ascension/Imbues already provide late growth.
The simplest near-term model is one selected Master and a readable innate
passive. If an evolution mastery tree is later approved, let it replace redundant
customization rather than add mandatory SP farming. Use a small mutually
exclusive choice; never require a Master/fully-leveled skill to unlock the
character's essential healer/tank role. Preserve/refund affected paid-in-game
investments only under an owner-approved migration contract.

## 6. Starter pilots: concrete functional sketches

These describe intended play, not new coefficients or approved kits.

| Pilot | Core technique | Advanced technique | Climax | One hook |
| --- | --- | --- | --- | --- |
| Infernis | Strike one enemy and apply Burn | Area strike; optionally cash out own Burn | Strong area Burn attack | Burn remaining damage and deliberate detonation. |
| Tizu | Place a useful barrier on a chosen ally, including self | Strike/weaken to reduce next pressure | Team barrier against a dangerous phase | Successful protection reinforces readiness; no separate Tide minigame. |
| Flora | Heal a wounded ally or plant useful team regeneration | Attack while reinforcing regeneration, or harvest as a deliberate rescue | Team recovery | One clearly visible delayed-heal state. |

Tizu's core/advanced ordering is intentionally different from today's slots.
That is an option to test, not a rename-only change: every Skill1/Skill2-bound
Conduit, icon, target rule and saved snapshot would need a reviewed mapping.
A lower-risk alternative keeps slots but labels their purposes explicitly.

For all three:
- Base form works solo, not only after acquiring a support trio.
- No zero-resource "do nothing" turn forced by the pilot redesign.
- A later evolution strengthens the same understandable role.
- Reuse all installed art and relevant VFX; do not repaint portraits to justify
  new mechanics. Motion communicates action/impact, not a new wait or RNG draw.
- Exact new copy, costs and values are presented for approval after benchmarks.

## 7. Compatibility and investment audit before implementation

An accepted new kit is incomplete until all relevant surfaces agree:

| Surface | Required work |
| --- | --- |
| Native catalog/runtime | Per-action targets, scaling, source/owner, caps, clocks, resets, death behavior and once-per-turn guards. |
| Normal/advanced stats | Old-to-new mapping, cost/gain floors, critical eligibility, pierce, healing and Shield ownership. |
| Ordinary Conduits | Audit all live entries for action-specific references, native counters, Gauge/capacity, role and trigger expectations. |
|114 authored Masters | All three alternatives per character; distinguish released from internal seasonal content. No blanket text replacement. |
| Ascension/Imbues | Preserve state/costs or obtain a precise conversion/refund decision. Skill1/Skill2 swapping must not silently move invested upgrades. |
| Captured copies | Keep UUID, level/form, locks, kit snapshot, lack of unavailable skills and mixed-squad viability. |
| Frozen runs | Rules-version restart with original frozen roster/gear/investments; saved rewards retained; stale actions do not execute on a replacement encounter. |
| Authority/client | Pure shared definitions and matching deployment; historical idempotent receipts retain actual saved outcomes. |
| Presentation | Character, Collections, Team, Battle menu, field statuses, cost preview, target preview, VFX/impact timing and accessibility. |
| Saves/acquisition | No load-time writes, no auto-granted team, no inventory deductions for historical evolutions, no new banner rarity claim. |
| Activities | Solo opening Story/Training and Lv.30 infusion; ordinary progression; optimized non-Calamitic late groups; Calamity separate. |

Some generated compatibility documents show historical catalog counts. Inventory
the current runtime catalogs when implementing; do not assume the older177-entry
matrix fully includes current114 Masters and all newer ordinary effects.

The just-released economy remains a fixed baseline for the first combat
experiment: additional farm reduction,1.5x rounded upgrade materials and
Value1/2/3/8/15 evolution fodder. Do not change costs simultaneously to make
clear-rate comparisons look better. Measure pacing separately.

## 8. Phased plan with review stops

### Phase0: evidence and owner decision

Deliver this audit, a current catalog inventory, and approval of the proposed
direction. No implementation. Settle the decisions in section10.
Current full-roster rankings are historical after newer mechanics/rosters;
reuse the [non-Calamitic methods](../roster-capability-audit.md), not stale ceilings.

### Phase1: controlled three-starter prototype

Build an isolated gameplay simulation/playable study for Infernis/Tizu/Flora,
using actual owned-like loadouts and the existing combat presentation foundation.
Do not connect it to real-account mutations or resume the all-screen UI mock-up.
Test consistent grammar first, keeping baseline stats/Gauge/economy.
Compare readability-only and functional kit simplification separately.
Owner reviews exact kits before a public migration.

### Phase2: Gauge/climax A/B

Only after phase1, compare the three cost/recovery alternatives above.
Report first-use timing, defensive opportunity cost and repeat cadence across
solo/duo/trio, base gear and advanced builds. Select one architecture.
Do not include random Types, REC, leader bonuses or trees in this experiment.

### Phase3: leader/passive/Master consolidation

Pilot one leader bonus per starter if separately approved. Assign each passive
and Master one clear responsibility. Audit all affected equipment and invested
progress. Stop if support identity or solo viability depends on owning another
rare character.

### Phase4: released roster batches

Rework by tactical clusters, not all32 at once:
1. Accessible starters and Standard roster.
2. Rose/War coordinated attackers and tanks.
3. Released Moon healers/supports.
4. Calamitic high-end rules, reviewed separately.

Each batch requires identity sketches, exact approved kits, full gear matrix,
readability review and pressured encounter results. Character art is reused.
Sunshade remains an internal pre-launch audit; no marketing/availability changes.
Overlapping tank/healer/alternation groups need explicit differentiation sign-off.

### Phase5: optional progression features

Only if players still need more build choice, compare a small mastery choice
against existing Masters. Recovery, reversible specializations and consumables
are independent proposals with their own tests; adding all is not the goal.
New guest/friend combat features and squad-size expansion are out of scope.

### Phase6: controlled release and observation

Publish shared client/authority only after acceptance, with exact rules migration,
historical receipt checks and hosted verification. Record which kits changed.
Monitor ordinary progression/frustration and unintended loops before the next
batch. Owner rollback policy must preserve new saved acquisitions and progress;
never revert wallet data just to return to old combat rules.

## 9. Validation and proposed acceptance gates

These are proposed targets, not claims that testing has already occurred.

### Comprehension/playtest

Recruit5-8 consenting participants mixing new and experienced players; do not
invent population averages from this small sample.
- After60 seconds with a character reference, at least80% identify its job,
  basic setup/payoff and defensive limitation without facilitator coaching.
- At least80% predict the target/effect/cost of representative legal actions.
- Track misclicks, misunderstood duration, wrong-resource waits and time spent
  reopening references; aim for fewer than the same participants' baseline.
- Ask whether a climax feels worth its cost and whether an ordinary turn offers
  a meaningful choice. Record qualitative findings, not just damage output.
- Keyboard/touch/Reduce motion users receive the same actionable state.

### Simulation/mechanics

- Separate zero-Defense DPR, realistic-Defense damage, effective healing,
  Shield creation, actual absorbed damage and packet survival.
- Compare1/2/3-member legal squads; only the single selected starter is free.
- Cover Lv.0/30/45/60/75/90/105, applicable Calamitic110/Ascended115 and
  captured60. Test no gear, ordinary progression and conditional optimized gear.
- Use multiple fixed seeds and pressured encounters. The current five-seed
  Lv.30 entry check is a regression baseline, not a complete clear-rate study.
- Preserve native/Conduit origin distinctions, no recursion, no duplicated
  Gauge from AoE/multi-hit/periodic packets and no heal-on-aura gain.
- Check first/second evolution access against the current fodder requirements.
- Test frozen-run resume/restart, Settings, Continue, Retry, defeat and final
  replay; every saved reward remains exactly once.

### Equipment and migration

- Every released Conduit/Master gets a compatible mapped effect or an explicit
  owner-approved conversion path; no hidden dead equipment.
- Retain owned IDs/counts/upgrades/configurations/locks and skill investments.
- Validate malformed/stale requests, overflow, denied saves and concurrent
  revision conflicts through the authority.
- Test unmarked historical receipts and new receipts without rewriting outcomes.
- Never balance ordinary enemies against a strongest paper outlier or merge
  Calamitic ceilings into ordinary expectations.

### Presentation

- Clear actual cost/target/readiness, one personal indicator and concise effect
  feedback; detailed source/math remains reachable.
- Measured animations over time, impact-aligned HP updates, immediate Skip,
  pointer-transparent/disposable effects and static Reduce motion feedback.
- No art/VFX flashes claim success before the save/accepted battle transaction.
- Any prototype's performance is measured; no60fps guarantee from screenshots.

## 10. Owner decisions before coding

1. **Direction:** standardize/simplify the current four actions, or prototype a
   strict two-tier upgrade ladder for selected characters?
2. **Climax:** retain personal Last Flare or test a team resource replacing its
   personal cost? Retain recovery in the first comparison?
3. **Stats:** simplify display of existing stats first, or specifically explore
   a true fourth Recovery stat and its investment conversion?
4. **Leader:** add one small leader bonus later, or leave positional leadership
   cosmetic and keep team influence in existing passives/Masters?
5. **Unlocks:** keep every currently owned active usable, or approve staged
   evolution unlocks with an explicit no-loss/compensation policy?
6. **Customization:** Masters as the main choice, or a replacement mastery
   system? Random summon Types are not recommended.
7. **Pilot scope:** three starters only, with an isolated no-account prototype
   and a review stop before roster rollout?
8. **Complexity budget:** approve one main personal hook/indicator and a common
   timing/scaling glossary, including a deliberate review of shield stacking?

**Recommended approval package:** phase1 starter-only prototype, current core
stats, no random Types/REC/tree/unlock loss, existing individual Gauge baseline,
one-hook grammar and a later separately reviewed team-climax experiment.
Do not begin all-roster implementation from a general preference for the reference.

## 11. Audit conclusion

Last Light does not need to become a clone or accumulate every historic system
to feel more intuitive. It already has normal attacks, personal Gauge, two
techniques, a climax, passives and deep equipment choices.

The refresh should make a player say **"I know what this character is for, I
know why this move is ready, and I know when to use it"**. Shared vocabulary,
distinct roles, fewer simultaneous counters and a measured climax choice are
more likely to achieve that than random Types and several new progression bars.
This plan changes no live mechanics until the owner selects and approves a phase.
