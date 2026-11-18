# Battle Flurry Phase 3: kit drafts and number sheet (2026-11-16)

**Status (2026-11-17):**
- **Owner-approved, not yet released:** the number sheet, O1-O5 as recommended,
  revised O5 role traits (Attacker +50% Skill Power only), and batches 1-4.
- Recorded as D-473. Step 2a (engine framework) implemented on branch
  `battle-flurry-phase3` (D-474, not released); signature clauses below run
  from Step 2b. All four batches implemented (D-475 to D-478; not released).
  Step 3 UI and kit text implemented (D-479); this text is now the tooltip
  source and `kit-text.test.ts` checks it word for word. Next: Step 4 (retune).

Plan: [battle-flurry-overhaul.md](../battle-flurry-overhaul.md), section D and
"Skill language".

Approval order: the number sheet with batch 1, then batches 2-4. All approved
batches are implemented and released together (owner choice: one release).

Owner choices already made for Phase 3:
- Defend is removed. Right-click, D and hold open the Skill 1 / Skill 2 / Flare grid.
- Health motes drop once per enemy defeat, with no randomness.

## Shared rules (glossary, written once)

- **Normal Attack** (every bearer): 1-hit attack of the bearer's element on one
  enemy (100%), drops a Gauge orb (Luminosity, see N1). Skill Power does not apply.
- **Turns** are player turns. A timed effect cast this turn counts its first turn
  at the end of this turn's enemy phase.
- **Categories** (see N6): Attack Up, Defense Up, Damage Reduction, Luminosity
  Gain Up, Health Over Time; enemy Weaken, Expose, Burn.
  - Same category does not stack: the strongest applies and the duration
    refreshes to the longer one.
  - Different categories combine.
- **Shields** last until broken; Shields from skills and Flares stack (D-434).
- **Auto-targeting**: ally skills hit all allies or the ally with the lowest
  Health; single-enemy skills hit the current target.
- **Role traits** (built in, shown beside the Passive; restored from D-437,
  draft values for the retune):
  - **Tank:** enemies target this bearer more often (weight 1.25 against 1,
    about 38% of random single-target attacks in a trio); +50% Defense.
  - **Attacker:** +50% Skill Power. The old +100% Direct Damage is dropped,
    because Radiant Attackers already carry that gap in base Attack.
  - **Support** (including Healer & Support): +50% Health, +25% Skill Power.
    Each skill and Flare also heals all allies (4% of max Health; not scaled by
    Skill Power, never on Normal Attack).
  - Targeting weight uses the existing enemy-targeting random stream, so no new
    stream is added. Scripted targeting patterns (lowest/highest Health) still
    override it.
- Numbers below are at base: form 1, rank 1, no Master or Conduits.

## Number sheet (approve with batch 1)

| # | Rule | Draft |
|---|---|---|
| N1 | Luminosity gains | Normal Attack hit +15 (was 10); being hit by an enemy +10; skills, Flares and defeats +0; same-element allies still share 10%. Gauge Gain multiplies every gain, rounded once. |
| N2 | Costs | Skill 1 = 25, Skill 2 = 40. Flare: Sparkling 100, Glimmering/Ultimate 200 (unchanged). Capacity unchanged. Skill Efficiency discount caps at 50%; floors 1 (skills) and 70 (Flare). |
| N3 | Flare tiers | Kits below show the **Ultimate** Flare. Glimmering: 75% of damage, 85% of effect values, 8 hits. Sparkling: 50% of damage, 70% of effect values, 4 hits. Durations do not change by tier. Convergent Light ranks keep +1% per rank. |
| N4 | Skill stats | Base Skill Power 100%, Skill Duration 0, Skill Efficiency 0%, Gauge Gain 100%. Skill Power scales skill and Flare damage, Burn, heals, Shields and buff/debuff strength. It does not scale Normal Attack or Conduit-generated effects. Skill Duration adds whole turns to timed skill effects (max 6 turns total). Existing Master scaling stays. |
| N5 | Health mote | Each enemy defeat drops one mote that heals the defeating bearer 10% of their max Health (not scaled by Skill Power; cannot revive). A Burn defeat sends the mote to the Burn's caster if alive. |
| N6 | Category caps | Attack Up +100%; Defense Up +100%; Damage Reduction 75%; Luminosity Gain Up +100%; Health Over Time 30% of max Health per turn; Weaken 50%; Expose +80%; Burn has no cap. |
| N7 | Heal/Shield basis | Kit heals and Shields = % of the recipient's max Health x the caster's Skill Power (the approved phrasing). Conduit-generated heals and Shields keep their current Recovery/Defense basis until Phase 4. |
| N8 | Damage | Formula unchanged (Attack/(Attack + Defense) mitigation, rounded once, floor 1). Multi-hit damage splits evenly; the last hit takes the remainder. |

## Owner questions (approved as recommended, 2026-11-16)

- **O1 Defend-triggered effects.** Five Conduit effects work only "while
  defending": `guard`, `guard-charge`, `guard-shield`, `guard-heal` and
  `guard-team-shield`.
  - They are used by about a dozen Conduits and the Tizu and Bruno Leaders
    (Orvella, Solenne and Serapha in later batches).
  - Removing Defend would turn them off.
  - **Recommended interim rule until Phase 4:** "defending" becomes "this bearer
    used Skill 1 or Skill 2 this turn". `guard` then gives only its own
    reduction, with no 50% base.
- **O2 Conditional damage Conduits.** Effects such as Opening, Burning, Weakened
  and Execution boost only Normal Attacks and Convergent Light. **Recommended:**
  they also boost Skill 1/2 damage.
- **O3 Ascension flags.** The `skill1`/`skill2` ascension currently boosts the
  Passive/Leader by 50%.
  - **Recommended:** restore the old meaning: +50% Skill Power and +5% Skill
    Efficiency on that skill.
  - The Passive and Leader lose the ascension boost. Save keys are unchanged.
- **O4 Category list.**
  - Radiant has no critical hits, so **Critical Up** cannot work. Replace it
    with the existing enemy **Expose** (the enemy takes more damage).
  - **Drop Up** would change rewards: remove it.
  - **Element Infusion**: defer, since no kit needs it.
  - The Shared rules section already reflects these recommendations.
- **O5 Role traits and Resonance** are not applied in Radiant combat today:
  enemies pick targets uniformly at random, and no role bonus exists (D-470
  said they stay). **Revised by owner (2026-11-16): restore the built-in role
  traits.** Each class has a trait in addition to its own Passive (see "Role
  traits" under Shared rules). Resonance: no change in Phase 3; re-check it
  during the retune.

## Batch 1: Opening and Flagships (10)

Leader effects keep their D-456 values and apply to allies of the leader's
element. "Uses a skill" in Leaders follows O1.

### Infernis (`ember`), Infernic Attacker. Signature: Burn detonation
- Passive, Unbroken Ember: boosts Burn damage of all allies (+30%).
- Skill 1, Cinder Cleave (25): 4-hit Infernic attack on one enemy (260%), adds
  Burn (25% Attack per turn, 3 turns).
- Skill 2, Flame Arc (40): 6-hit Infernic attack on all enemies (180%),
  detonates Infernis's Burn on each target (deals up to 2 remaining turns at once).
- Flare, Dawnfire: 12-hit Infernic attack on all enemies (900%), adds Burn (100%
  Attack per turn, 3 turns), boosts Attack of all allies (+50%, 3 turns).
- Leader, Hearthbound Oath: boosts Normal Attack damage of Infernic allies
  (+20%), boosts Burn damage of Infernic allies (+15%).

### Tizu (`tide`), Oceanic Tank. Signature: full-block refunds
- Passive, Stillwater Guard: when a Shield from Tizu fully blocks a hit, that
  ally gains 8 Luminosity.
- Skill 1, Undertow Thrust (25): 4-hit Oceanic attack on one enemy (240%),
  Weakens target (-25% Attack, 2 turns).
- Skill 2, Tidal Shelter (40): grants all allies a Shield (25% of max Health),
  boosts Defense of all allies (+30%, 2 turns).
- Flare, Ocean Memory: grants all allies a Shield (50% of max Health), reduces
  damage taken by all allies (-30%, 2 turns).
- Leader, Harbor Covenant: boosts Defense of Oceanic allies (+20%); an Oceanic
  ally that uses a skill gains a Shield (40% of its Defense).

### Flora (`sprout`), Botanic Healer & Support. Signature: Seeds
- Passive, Root of Hope: a Seed heals its holder (30% of max Health) at the
  start of the next player turn while Flora lives. One Seed per ally.
- Skill 1, Briar Shot (25): 4-hit Botanic attack on one enemy (220%), plants a
  Seed on the ally with the lowest Health.
- Skill 2, Verdant Renewal (40): heals all allies (25% of max Health), plants a
  Seed on all allies.
- Flare, Worldseed: heals all allies (60% of max Health), plants an Empowered
  Seed on all allies (heals 60%), boosts Luminosity gained by all allies (+30%,
  3 turns).
- Leader, Garden Covenant: boosts healing done by Botanic allies (+20%); at the
  start of each player turn, each Botanic ally heals the ally with the lowest
  Health (10% of its Recovery).

### Atmoso (`atmoso`), Atmospheric Attacker. Signature: Cyclone
- Passive, Gale Cadence: each Normal Attack by another ally adds 1 Gust to
  Atmoso's Cyclone (max 5 Gusts).
- Skill 1, Razor Gale (25): 3-hit Atmospheric attack on one enemy (250%),
  releases Atmoso's Cyclone now.
- Skill 2, Cyclone Weave (40): 5-hit Atmospheric attack on all enemies (150%),
  creates a Cyclone (after 2 turns, deals 60% Attack + 20% per Gust to all
  enemies). A new Cyclone releases the old one first.
- Flare, Sky Without End: 12-hit Atmospheric attack on all enemies (850%),
  releases the Cyclone at triple damage, Weakens all enemies (-15% Attack, 2 turns).
- Leader, Open-Sky Route: boosts damage of Atmospheric allies after another
  ally has acted this turn (+20%); an Atmospheric ally's Normal Attack hit fills
  2 extra Luminosity.

### Aurora (`aurora`), Tranquilitic Support. No signature
- Passive, Lens of Diminishment: Weaken from all allies lasts 1 more turn.
- Skill 1, Gleamseal (25): 3-hit Tranquilitic attack on one enemy (200%),
  Weakens target (-30% Attack, 2 turns).
- Skill 2, Eclipse Mandate (40): 4-hit Tranquilitic attack on all enemies
  (140%), Weakens all enemies (-20% Attack, 2 turns).
- Flare, Final Dawn Verdict: 8-hit Tranquilitic attack on all enemies (400%),
  Weakens all enemies (-35% Attack, 3 turns), reduces damage taken by all allies
  (-30%, 2 turns).
- Leader, Merciful Verdict: boosts damage of Tranquilitic allies against
  Weakened enemies (+20%); reduces Weaken on Tranquilitic allies (-20% of its
  strength).

### Bliss (`bliss`), Tranquilitic Attacker. Signature: Tempo
- Passive, Stillfeather Tempo: a skill or Flare gets its **Opening** bonus if
  Bliss acts before every other living ally this turn, and its **Closing** bonus
  if she acts after all of them. When alone, every action is Opening.
- Skill 1, Warfeather Cut (25): 4-hit Tranquilitic attack on one enemy (260%).
  Opening: this attack deals +30%. Closing: heals the ally with the lowest Health
  (15% of max Health).
- Skill 2, Quietstorm Flourish (40): 6-hit Tranquilitic attack on all enemies
  (170%). Opening: boosts Attack of all allies (+20%, 1 turn). Closing: grants
  all allies a Shield (10% of max Health).
- Flare, Thousandfeather Stillness: 12-hit Tranquilitic attack on all enemies
  (950%). Opening: this attack deals +40%. Closing: heals all allies (25% of max
  Health).
- Leader, Quietstorm Measure: a Tranquilitic ally's Normal Attack hit boosts
  Attack of the next ally who has not acted (+10%, this turn), and heals the ally
  with the lowest Health (12% of its Recovery).

### Bruno (`bruno`), Botanic Tank. Signature: Cover
- Passive, Faultbound Resolve: damage redirected to Bruno by Cover is reduced
  by 25%.
- Skill 1, Seismic Hammerfall (25): 3-hit Botanic attack on one enemy (240%),
  boosts Defense of Bruno (+30%, 2 turns).
- Skill 2, Citadel Mantle (40): places Cover on all other allies (Bruno takes
  40% of their direct damage, 1 turn), grants Bruno a Shield (20% of max Health).
- Flare, Worldwall Ascendant: places Cover on all other allies (Bruno takes 60%,
  2 turns), boosts Defense of all allies (+40%, 2 turns), grants Bruno a Shield
  (40% of max Health).
- Leader, Worldwall Stand: a Botanic ally that uses a skill takes 12% less
  direct damage until the next player turn and grants all allies a Shield (20%
  of its Defense).

### Disciple (`disciple`), Chaotic Support. No signature
- Passive, Shared Mindflame: Attack Up from Disciple also fills Luminosity of
  each ally it reaches (+5).
- Skill 1, Thoughtspark Benediction (25): boosts Attack of all allies (+30%,
  2 turns).
- Skill 2, Concord of Chaos (40): 4-hit Chaotic attack on all enemies (140%),
  fills Luminosity of all other allies (+12).
- Flare, Unbound Mindcrown: boosts Attack of all allies (+60%, 3 turns), fills
  Luminosity of all other allies (+25).
- Leader, Unbound Concord: boosts Convergent Light damage of Chaotic allies
  (+20%); a Chaotic ally's Convergent Light fills Luminosity of each other ally
  (+3).

### Elise (`elise`), Atmospheric Attacker. Signature: Shuriken
- Passive, Stormwheel Rhythm: Elise holds 2 Shuriken. A lodged Shuriken returns
  to her, without damage, when its enemy is defeated.
- Skill 1, Voltstar Cut (25): 3-hit Atmospheric attack on one enemy (220%),
  lodges a held Shuriken in the target. With no Shuriken held: 280% instead.
- Skill 2, Crosscurrent Volley (40): 2-hit Atmospheric attack on one enemy
  (180%), recalls all lodged Shuriken (each strikes its enemy for 150% Attack).
- Flare, Infinite Thunderwheel: 12-hit Atmospheric attack on one enemy (1300%),
  recalls all lodged Shuriken (each strikes its enemy for 400% Attack).
- Leader, Crosswind Opening: boosts damage of Atmospheric allies that act
  before every other ally this turn (+25%); attacks by Atmospheric allies ignore
  enemy Defense (10%).

### Razor (`razor`), Chaotic Tank. Signature: Wounds
- Passive, Unbroken Night: Health Razor loses to enemy hits is stored as Wounds.
  Shield-absorbed damage, redirected damage and Burn add none; healing does not
  remove Wounds.
- Skill 1, Nightcleave (25): 3-hit Chaotic attack on one enemy (220%), spends
  all Wounds for an extra strike (deals damage equal to the Wounds spent).
- Skill 2, Eclipse Bastion (40): reduces damage taken by Razor (-30%, 1 turn),
  grants Razor a Shield (20% of max Health).
- Flare, Unbroken Midnight: 12-hit Chaotic attack on one enemy (1100%), spends
  all Wounds for an extra strike (3 times the Wounds spent).
- Leader, Midnight Bastion: boosts damage of Chaotic allies while they have a
  Shield (+25%); after a Chaotic ally's Normal Attack hit, it takes 8% less
  direct damage until the next player turn.

## Batch 2: Rose and Calamitic (6), owner-approved 2026-11-16

Calamitic (7-star) numbers sit about 10-15% above the 6-star batch.

### Rosetta (`rosetta`), Tranquilitic Attacker. Signature: Quarry
- Passive, Virtuous Bloom: Rosetta marks one enemy as her Quarry. Each other
  ally whose attack hits the Quarry this turn counts as a contributor.
- Skill 1, Golden Thorn Volley (25): 4-hit Tranquilitic attack on one enemy
  (250%), marks it as Quarry, Exposes target (+15% damage taken, 2 turns).
- Skill 2, Crimson Skyfall (40): 5-hit Tranquilitic attack on the Quarry, or on
  the current target if there is none (300%, +40% per contributor this turn).
- Flare, Rose Beyond the Sun: 12-hit Tranquilitic attack on the Quarry, or on
  the current target if there is none (1350%), Exposes target (+30% damage
  taken, 3 turns), heals each contributor this turn (20% of max Health).
- Leader, Quarry Oath: boosts damage of Tranquilitic allies against Exposed
  enemies (+25%); a Tranquilitic ally's Normal Attack hit Exposes the target
  (+8% damage taken, this turn).

### Thornia (`thornia`), Chaotic Tank. Signature: Thorn Trap
- Passive, Forbidden Garden: when an enemy with Thornia's Thorn Trap damages an
  ally, the trap spends 1 charge to strike it (60% Attack), once per enemy action.
  Each enemy holds one trap.
- Skill 1, Gilded Thorn Guard (25): 2-hit Chaotic attack on one enemy (160%),
  places a Thorn Trap on the target (3 charges, 3 turns).
- Skill 2, Shadow Rose Cleave (40): 4-hit Chaotic attack on one enemy (250%),
  spends 1 Thorn Trap charge on the target for an extra strike (100% Attack),
  grants all allies a Shield (15% of max Health).
- Flare, Thousand-Rose Dominion: 12-hit Chaotic attack on all enemies (650%),
  places an Empowered Thorn Trap on each enemy (3 charges, strikes for 200%
  Attack, 3 turns), grants all allies a Shield (30% of max Health).
- Leader, Garden Gate: boosts Shields from Chaotic allies' skills (+20%); when
  an enemy hits a Shield from a Chaotic ally, reflects 20% of that damage (once
  per turn, up to that ally's Attack).

### Crinso (`crinso`), Chaotic Attacker. Signature: Combo
- Passive, Rose Duality: using Skill 1 and Skill 2 alternately adds 1 Combo (max
  5). Repeating the same skill resets Combo to 0. Normal Attack does not affect it.
- Skill 1, Golden Edge (25): 4-hit Chaotic attack on one enemy (250%). After
  Crimson Rupture, it ignores 20% of the target's Defense.
- Skill 2, Crimson Rupture (40): 5-hit Chaotic attack on one enemy (310%; 370%
  after Golden Edge), adds Burn (20% Attack per turn, 2 turns).
- Flare, Blossoming Cataclysm: 12-hit Chaotic attack on one enemy (1200%, +200%
  per Combo), ignores 45% of the target's Defense at 3+ Combo, spends all Combo.
- Leader, Twin-Rose Accord: boosts damage of Chaotic allies against Burning
  enemies (+25%); attacks by Chaotic allies restore their Health (4% of Health
  damage dealt).

### Ozriel (`ozriel`), Tranquilitic Tank, 7-star. Signature: Refusal
- Passive, Refusal: while Ozriel lives, each ally survives one lethal hit per
  encounter with 1 Health.
- Skill 1, Pane of Absolution (25): 3-hit Tranquilitic attack on one enemy
  (230%), Weakens target (-40% Attack, 2 turns).
- Skill 2, Cathedral of Shards (40): grants all allies a Shield (30% of max
  Health).
- Flare, The World Refuses: 12-hit Tranquilitic attack on all enemies (500%),
  grants all allies a Shield (55% of max Health), reduces damage taken by all
  allies (-25%, 2 turns).
- Leader, Refusal: Tranquilitic allies above 75% Health take 12% less direct
  damage; a Tranquilitic ally whose Health an enemy damages gains a Shield (3% of
  max Health, once per turn).

### Ilvaris (`ilvaris`), Atmospheric Support, 7-star. Signature: Fate-seared Mark
- Passive, Severed Prophecy: each Fate-seared Mark stack makes its enemy take
  +10% damage from all allies (max 5 stacks, 2 turns; a new stack refreshes the
  duration).
- Skill 1, Unwritten Verse (25): 3-hit Atmospheric attack on one enemy (220%),
  adds 1 Fate-seared Mark.
- Skill 2, Glasschoir Hymn (40): heals all allies (30% of max Health), boosts
  Attack of all allies (+30%, 2 turns). Renamed from the old "Hymn of Broken
  Glass" because that is Ilvaris's Leader name.
- Flare, Tomorrow, Unwritten: 12-hit Atmospheric attack on all enemies (500%),
  adds 2 Fate-seared Marks to each enemy, heals all allies (50% of max Health),
  fills Luminosity of all allies (+15).
- Leader, Hymn of Broken Glass: each ally healed by an Atmospheric ally gains
  Attack (+10%, this turn); Atmospheric allies gain 2 Luminosity at the start of
  each player turn.

### Kaelith (`kaelith`), Chaotic Attacker, 7-star. Signature: Fractalized Incision
- Passive, Reality Fault: each skill or Flare from Kaelith adds 1 Incision to
  every enemy it hits (max 3). Each Incision makes that enemy take +10% damage
  from all allies until consumed.
- Skill 1, Shatterfall (25): 5-hit Chaotic attack on all enemies (200%).
- Skill 2, Glass Meridian (40): 6-hit Chaotic attack on one enemy (360%, +20% per
  Incision on it), then consumes its Incisions.
- Flare, Denial of Fate: 12-hit Chaotic attack on all enemies (1000%), Exposes
  all enemies (+25% damage taken, 2 turns).
- Leader, Fractalized Incision: boosts damage of Chaotic allies against enemies
  at full Health (+25%) and against Exposed enemies (+20%).

## Batch 3: Elemental War (10), owner-approved 2026-11-16

The old per-skill Taunts are covered by the restored Tank role trait (enemies
target Tanks more often), so no skill repeats it.

### Nerithe (`nerithe`), Oceanic Attacker. Signature: Survey
- Passive, Uncharted Current: Nerithe's Normal Attack fills 5 extra Luminosity
  and adds 1 Survey to its target (max 3). Only one enemy holds Survey; surveying
  another enemy removes it from the old one.
- Skill 1, Meridian Break (25): 4-hit Oceanic attack on the Surveyed enemy, or
  on the current target if there is none (260%), spends 1 Survey to ignore 25% of
  its Defense.
- Skill 2, Fold the Sea (40): 6-hit Oceanic attack on all enemies (180%), moves
  all Survey to the current target.
- Flare, Ocean Beyond the Map: 12-hit Oceanic attack on the Surveyed enemy, or
  on the current target if there is none (1250%), spends all Survey (each ignores
  20% of its Defense).
- Leader, Uncharted Meridian: an Oceanic ally's Normal Attack hit Exposes the
  target (+10% damage taken, this turn) and fills each other ally's Luminosity
  (+1).

### Orvella (`orvella`), Botanic Tank. Signature: Foundation
- Passive, Load-Bearing Will: while Orvella's Foundation has durability, it
  absorbs 20% of each direct hit on an ally (before Shields) and loses that much
  durability. Only one Foundation exists.
- Skill 1, Keystone Reversal (25): 3-hit Botanic attack on one enemy (210%),
  repairs the Foundation (8% of Orvella's max Health). With no Foundation: 270%
  instead.
- Skill 2, Raise the Faultline (40): creates a Foundation (durability 35% of
  Orvella's max Health, 3 turns), boosts Defense of all allies (+25%, 2 turns).
  Recasting replaces it at full durability.
- Flare, Worldweight Citadel: 12-hit Botanic attack on all enemies (900%),
  spends the Foundation for an extra strike on each enemy (3 times its remaining
  durability), then creates a new Foundation (durability 50% of Orvella's max
  Health, 3 turns).
- Leader, Load-Bearing Will: a Botanic ally that uses a skill gains a Shield
  (35% of its Defense); when an enemy damages a Botanic ally's Health, that ally
  heals the other ally with the lowest Health (12% of its Recovery, once per turn).

### Vaelor (`vaelor`), Atmospheric Attacker. Signature: Beat
- Passive, Standing Thunder: the Beat cycles Tune, Rise, Crescendo, one step
  each player turn, starting on Tune.
- Skill 1, Forked Cadence (25): 4-hit Atmospheric attack on one enemy (250%). On
  Tune: this attack deals +30%.
- Skill 2, Resonance Cascade (40): 6-hit Atmospheric attack on all enemies
  (170%). On Rise: boosts Attack of Vaelor (+25%, 2 turns).
- Flare, Last Chord of the Sky: 12-hit Atmospheric attack on all enemies (1150%;
  1500% on Crescendo).
- Leader, Standing Thunder: boosts damage of Atmospheric allies after another
  ally has acted this turn (+20%); an Atmospheric ally's Normal Attack hit also
  strikes the healthiest other enemy (12% of that damage).

### Caldrex (`caldrex`), Infernic Tank. Signature: Heat
- Passive, Banked Heat: Caldrex gains 1 Heat (max 3) when an enemy damages his
  Health or Shield, once per enemy phase. Heat resets each encounter.
- Skill 1, Close the Kiln (25): grants all allies a Shield (15% of max Health),
  boosts Defense of Caldrex (+30%, 2 turns).
- Skill 2, Cinder Discharge (40): 5-hit Infernic attack on all enemies (220%,
  +25% per Heat spent), adds Burn (20% Attack per turn, 3 turns), spends all Heat.
- Flare, Nothing Beyond These Gates: grants all allies a Shield (50% of max
  Health, +5% per Heat spent), boosts Burn damage of all allies (+25%, 2 turns),
  spends all Heat.
- Leader, Banked Heat: Infernic allies heal 10% of the Health damage their Burn
  deals; when an enemy damages an Infernic ally's Health, that ally gains a Shield
  (2.5% of max Health, once per turn).

### Solenne (`solenne`), Tranquilitic Tank. Signature: Stillness
- Passive, Held Stillness: Solenne holds up to 4 Stillness. Each hit she takes
  spends 1 Stillness to reduce that damage by 20% before Shields. Stillness
  resets each encounter.
- Skill 1, Answer the Bell (25): 3-hit Tranquilitic attack on one enemy (220%),
  Weakens target (-25% Attack, 2 turns).
- Skill 2, Circle of Repose (40): grants all allies a Shield (18% of max Health),
  Solenne gains 2 Stillness.
- Flare, The Last Reverberation: 12-hit Tranquilitic attack on all enemies (700%,
  +45% per Stillness spent), grants all allies a Shield (25% of max Health, +5%
  per Stillness spent), spends all Stillness.
- Leader, Held Stillness: a Tranquilitic ally that uses a skill takes 10% less
  direct damage until the next player turn; when an enemy breaks a Tranquilitic
  ally's last Shield, that ally heals (20% of its Recovery, once per turn).

### Myrthen (`myrthen`), Botanic Attacker. Signature: Season
- Passive, Turning Season: each skill advances the Season from Sprout to Bloom
  to Harvest. In Harvest, the next skill or Flare deals +35% and ignores 20% of
  Defense, then the Season returns to Sprout. Battles start in Sprout.
- Skill 1, Reaper's Claim (25): 4-hit Botanic attack on one enemy (250%), Exposes
  target (+12% damage taken, 2 turns).
- Skill 2, Turn the Bough (40): 6-hit Botanic attack on all enemies (170%).
- Flare, All That Ripens: 12-hit Botanic attack on one enemy (1250%).
- Leader, Turning Season: boosts damage of Botanic allies against enemies at or
  below 25% Health (+30%); a Botanic ally's defeat of an enemy heals the ally with
  the lowest Health (3% of its max Health, once per action).

### Neralis (`neralis`), Oceanic Healer & Support. Signature: Current
- Passive, Returning Current: Neralis gains 1 Current (max 3) once per action
  when his Normal Attack hits or his skill restores Health.
- Skill 1, Light the Next Station (25): heals the ally with the lowest Health
  (35% of max Health), boosts Defense of that ally (+30%, 2 turns).
- Skill 2, Carry Them Back (40): heals all allies (18% of max Health, +6% per
  Current spent), spends all Current.
- Flare, No Crossing Left Empty: 12-hit Oceanic attack on all enemies (650%),
  heals all allies (30% of max Health, +5% per Current spent), spends all Current.
- Leader, Returning Current: when an Oceanic ally's skill restores Health, each
  other ally gains 2 Luminosity (once per action); boosts Shields from Oceanic
  allies' skills (+15%).

### Varkhel (`varkhel`), Infernic Tank. Signature: Tension
- Passive, Tension Held: Varkhel gains 1 Tension (max 4) when an enemy damages
  his Health or Shield (once per enemy phase) and when his Normal Attack hits.
- Skill 1, Set the Warning Chain (25): grants Varkhel a Shield (25% of max
  Health), boosts Defense of Varkhel (+40%, 2 turns).
- Skill 2, Return the Strain (40): 4-hit Infernic attack on one enemy (260%, +45%
  per Tension spent), ignores 20% of its Defense, spends all Tension.
- Flare, The Bridge Holds Behind Me: 12-hit Infernic attack on all enemies (650%,
  +55% per Tension spent), grants all allies a Shield (30% of max Health), spends
  all Tension.
- Leader, Tension Held: boosts damage of Infernic allies at or below half Health
  (+25%); an Infernic ally's Normal Attack hit on Health grants it a Shield (25%
  of its Defense).

### Seravelle (`seravelle`), Infernic Support. Signature: Cadence
- Passive, Convoy Cadence: while Seravelle lives, the first ally Normal Attack
  that hits each turn adds 1 Cadence (max 3).
- Skill 1, Send the Ember Ahead (25): 4-hit Infernic attack on one enemy (230%),
  adds Burn (15% Attack per turn, 2 turns).
- Skill 2, Move as One (40): boosts Attack of all allies (+30%, +10% per Cadence
  spent, 2 turns), spends all Cadence.
- Flare, The Road Belongs to Everyone: 12-hit Infernic attack on all enemies
  (600%), fills Luminosity of all other allies (+20), boosts Luminosity gained by
  all allies (+30%, 2 turns).
- Leader, Convoy Cadence: an Infernic ally's Normal Attack hit on Health heals
  the ally with the lowest Health (15% of its Recovery); an Infernic ally's
  Convergent Light fills each other ally's Luminosity (+3).

### Velmira (`velmira`), Chaotic Attacker. Signature: Crosscut
- Passive, Alternating Edge: each skill Velmira lands on a Weakened enemy adds 1
  Crosscut (max 3). This differs from Crinso's alternating Combo.
- Skill 1, Open the Seam (25): 4-hit Chaotic attack on one enemy (260%), Weakens
  target (-25% Attack, 2 turns).
- Skill 2, Turn the Other Edge (40): 6-hit Chaotic attack on all enemies (180%),
  ignores 20% of Defense with 2+ Crosscut (keeps Crosscut).
- Flare, Leave the Doorway Standing: 12-hit Chaotic attack on one enemy (1000%,
  +90% per Crosscut spent), ignores 30% of its Defense, spends all Crosscut.
- Leader, Alternating Edge: boosts damage of Chaotic allies against Weakened
  enemies (+20%); a Chaotic ally's Normal Attack hit on Health Weakens the target
  (-8% Attack, 1 turn).

## Batch 4: Moon (6), owner-approved 2026-11-16

Moon banners and events stay inactive until explicit launch approval; these kits
replace the ones already in code. Old "one chosen ally" skills auto-target the
ally with the lowest Health. Old one-shot tokens are mapped onto the categories:
Moonflower becomes Attack Up and Ceasefire becomes Damage Reduction.

### Maerion (`maerion`), Oceanic Healer & Support. Signature: Unreturned
- Passive, Names Still Carried: while Maerion lives, Health allies lose to
  direct enemy hits is stored as Unreturned (max 45% of Maerion's max Health).
  Burn and redirected damage add none.
- Skill 1, Crescent Triage (25): 3-hit Oceanic attack on one enemy (200%), heals
  the ally with the lowest Health (25% of max Health).
- Skill 2, A Place on the Ferry (40): heals the ally with the lowest Health (45%
  of max Health, plus all Unreturned), spends all Unreturned.
- Flare, Bring Every Name Home: heals all allies (65% of max Health, plus
  Unreturned split evenly), spends all Unreturned.
- Leader, Open Ferry: boosts Recovery of Oceanic allies (+20%); once per action,
  an Oceanic ally whose skill restores Health gains 2 Luminosity.

### Caevren (`caevren`), Atmospheric Tank. Signature: Load
- Passive, Weight of the Watch: Caevren gains 1 Load (max 3) when an enemy
  damages his Health or Shield, once per enemy phase. Redirected hits count.
- Skill 1, Hold the Meridian (25): 4-hit Atmospheric attack on one enemy (250%),
  boosts Defense of Caevren (+30%, 2 turns).
- Skill 2, Counterweight Covenant (40): grants the ally with the lowest Health a
  Shield (30% of max Health), places Cover on all other allies (Caevren takes 30%
  of their direct damage, 2 turns).
- Flare, The Night Shall Not Fall: grants Caevren a Shield (60% of max Health,
  +12% per Load spent), places Cover on all other allies (Caevren takes 30%, 2
  turns), reduces damage taken by all allies (-20%, 2 turns), spends all Load.
- Leader, Bridgeweight Vow: enemy attacks dealing more than 20% of an
  Atmospheric ally's max Health deal 10% less damage to it; once per turn, when
  an enemy hits a Shield from an Atmospheric ally, that ally gains 3 Luminosity.
- Cover works as in Bruno's kit, so it is one shared rule rather than a second
  signature.

### Vespera (`vespera`), Infernic Support. Signature: Signal
- Passive, Someone Still Beyond the Walls: Signal makes an ally's next damaging
  skill or Flare deal +35%, until the end of the next player turn. Reapplying
  refreshes it rather than stacking.
- Skill 1, Whitefire Dispatch (25): 3-hit Infernic attack on one enemy (210%),
  adds Burn (25% Attack per turn, 3 turns).
- Skill 2, Keep the Last Beacon (40): gives Signal to all other allies.
- Flare, None Left in the Dark: 12-hit Infernic attack on all enemies (600%),
  gives an Empowered Signal to all other allies (+50%), boosts Burn damage of all
  allies (+20%, 2 turns).
- Leader, Last Beacon: boosts Burn damage of Infernic allies (+20%); an Infernic
  ally's Normal Attack hit on Health boosts Attack of the next ally who has not
  acted (+10%, this turn).

### Ilyss (`ilyss`), Chaotic Healer & Support. Signature: Severance
- Passive, What Need Not Remain: when Ilyss removes a Weaken from an ally, she
  gains 1 Severance (max 3), once per player turn.
- Skill 1, Cut the Harmful Thread (25): 3-hit Chaotic attack on one enemy
  (210%), Weakens target (-25% Attack, 2 turns).
- Skill 2, Unbind the Living (40): heals the ally with the lowest Health (45% of
  max Health), removes Weaken from that ally.
- Flare, No Promise of Resurrection: heals all allies (60% of max Health, +10%
  per Severance spent), removes Weaken from all allies, spends all Severance.
- Leader, Living Thread: reduces Weaken on Chaotic allies (-25% of its
  strength); each ally a Chaotic ally heals gains a Shield (20% of the healer's
  Defense, once per action).

### Asteriel (`asteriel`), Botanic Support. Signature: Path
- Passive, Futures Given Freely: Skill 1 enters Shelter and Skill 2 enters
  Flourish. Switching between them grants 1 Promise (max 3). Battles start with
  no path.
- Skill 1, Lend the Quiet Seed (25): grants all allies a Shield (22% of max
  Health), enters Shelter.
- Skill 2, Open the Night Library (40): boosts Attack of all allies (+30%, 1
  turn), enters Flourish.
- Flare, Every Orbit Bears a Future: in Shelter or with no path, grants all
  allies a Shield (45% of max Health, +8% per Promise spent). In Flourish, boosts
  Attack of all allies (+50%, +10% per Promise spent, 2 turns). Spends all
  Promise and keeps the current path.
- Leader, Shared Orbit: at the start of each player turn, each Botanic ally
  heals all allies (6% of its Recovery); each ally a Botanic ally heals gains
  Attack (+8%, this turn).

### Serapha (`serapha`), Tranquilitic Healer & Support. Signature: Interval
- Passive, An Interval Without Surrender: when an enemy Weakened by Serapha
  attacks, she gains 1 Interval (max 3), once per enemy phase.
- Skill 1, Terms of Mercy (25): 3-hit Tranquilitic attack on one enemy (230%),
  Weakens target (-20% Attack, 2 turns).
- Skill 2, A Passage Left Open (40): heals all allies (28% of max Health),
  reduces damage taken by all allies (-20%, 1 turn).
- Flare, Let Them Leave Alive: heals all allies (65% of max Health), reduces
  damage taken by all allies (-20%, +5% per Interval spent, 2 turns), spends all
  Interval.
- Leader, Ceasefire Interval: Tranquilitic allies above 75% Health take 10% less
  direct damage; a Tranquilitic ally that uses a skill heals itself (20% of its
  Recovery).

## Step 4 retune sheet (proposal, 2026-11-17; numbers await owner approval)

**Status:** the five Conduit reworks below are owner-approved (2026-11-17) and
implemented on branch `battle-flurry-phase3`. The enemy calibration numbers are a
**proposal**: the live calibration is still `authored-control` (every factor 1)
until the owner approves. Owner choices already made: tune enemy stat factors
only (formations and rewards unchanged), measure a Flare-saving player too,
Resonance stays off, reuse the D-404 targets.

### How it was measured

- `node tools\run_pressure_study.mjs <out.jsonl> --retune` (study) and
  `--retune-fit` (fitting sweep); `node tools\render_retune_report.mjs` renders
  the tables. Offline only: no account writes, no reward RNG.
- D-404 preparation: player level = enemy level - 1 (cap 105), least
  evolution, gear common0 up to Lv.40, mixed0 to 80, mixed5 to 105, omnic5 to
  120, master5 above; Convergent Light rank 1, no ascension.
- Ordinary teams: Infernis/Tizu/Flora, Infernis/Atmoso/Flora, Elise/Bruno/Flora,
  Infernis/Tizu/Atmoso, Atmoso/Bruno/Flora, Elise/Tizu/Flora. Calamity: the six
  Lv.105 D-404 trios with master5 gear. 284 anchors, 3 seeds (species anchors 1).
- Two simulated players: `balanced` (spends Luminosity on skills as soon as it
  can; the tuning target) and `flare-saving` (saves for the Flare, still
  protects, spends at capacity; reported, not tuned against).
- Simulator fix: a lone survivor at or above half Health now attacks instead of
  healing itself forever (that loop produced fake "stalls").

### Conduit reworks (owner-approved, implemented)

IDs, ownership, ranks, price and art unchanged; values grow +10% per rank.

| Conduit | Old effect | New effect |
|---|---|---|
| Starvein Conductor (Legendary) | Burn +40%; +25% vs burning | Once per action, this bearer's skills and Convergent Light heal the most-wounded living ally for 15% of the direct Health damage they deal. Burn from this bearer's abilities deals 20% more damage. |
| Horizon Heartcase (Legendary) | Shield when hit; +5 Luminosity when hit | When this bearer uses Skill 1 or Skill 2, every living ally gains a Shield worth 40% of this bearer's current Defense. Keeps +5 Luminosity when hit (once per round). |
| Duplex Heart (Rare) | Heal-when-hit | The same skill-damage heal as Starvein Conductor, at 10%. |
| Reserve Torque Crank (Common) | +2 Luminosity per Normal | Normal Attacks, skills and Convergent Light restore this bearer's Health by 15% of the direct Health damage they deal; keeps +1 Luminosity per Normal. |
| Fieldbrace Coupler (Common) | Heal when last Shield breaks | This bearer's Normal Attacks, skills and Convergent Light deal 30% more damage to enemy Shields. |

Two small deviations from the approved proposal, made because a test requires
every Conduit design to be distinct: Reserve Torque Crank keeps +1 Luminosity
per Normal (its heal alone matched Lifeline Flywheel), and Horizon Heartcase
keeps its +5 Luminosity when hit instead of a Shield when hit (that pair matched
Calamitic Bulwark of the Last Horizon). Tooltip fixes in the same change:
conditional-damage, pierce, cooperation and leech text now say they apply to
skills too, and the Defend-era effects now say "uses Skill 1 or Skill 2".

### Proposed calibration `radiant-trio-v1` (candidate D)

Model: levels 1-95 unchanged. Above that, an enemy of level L gets the shared
curve's Health/Attack/Defense at a lower **effective level** E, which never goes
down as L rises, so calibrated stats never fall with level. Ordinary enemies,
bosses and Calamity each have their own E curve (new optional
`categoryPoints` field; existing calibrations unaffected).

| Real level | Ordinary fights like | Bosses fight like | Calamity fights like |
|---|---|---|---|
| 1-95 | same level | same level (to 90) | - |
| 100 | 95 | about 96 | - |
| 105 | 95 | 99 | - |
| 110-120 | 95 | 100 | - |
| 125-140 | 95 rising to 103 | 101 | - |
| 145 (EX+1) | 103 | 104 | **103** |
| 150-180 | 103 | 105-108 | - |
| 160 (EX+2) | 103 | 107 | **109** |
| 170 (EX+3) | 103 | 108 | **111** |
| 185 | 108 | 113 | 111 + tail |

Exact factor table (Health / Attack / Defense multipliers on the authored
stats), interpolated linearly between points:
- Ordinary: 95: 1/1/1; 100: .6981/.7958/.7819; 105: .5005/.6457/.6275;
  110: .362/.5435/.5235; 115: .274/.472/.451; 120: .2227/.418/.3972;
  140: .2128/.4513/.4163; 150: .1408/.358/.3105; 155: .1126/.3264/.2675;
  160: .09/.2895/.2292; 170: .0576/.2472/.1709; 180: .0369/.1812/.1239;
  185: .0412/.1869/.1285.
- Boss: 90: 1/1/1; 105: .671/.7751/.765; 115: .3924/.5931/.5768;
  120: .3189/.5252/.5079; 125: .2901/.5018/.4814; 135: .2164/.4502/.4178;
  140: .1863/.4145/.3807; 150: .1611/.3874/.3376; 165: .1004/.3214/.2409;
  175: .0643/.255/.1771; 180: .0514/.2183/.1508; 185: .0556/.2177/.1509.
- Calamity: 80: 1/1/1; 145: .1762/.4053/.3629; 160: .1338/.3604/.2887;
  170: .0968/.3276/.2299; 185: .0918/.2877/.2036.

### Results (skill-spending player; flare-saving in brackets)

| Scope | Today (`authored-control`) | Candidate D | Target |
|---|---|---|---|
| Ordinary, all fights | 62.0% (61.6%) | **96.9%** (93.3%) | 95% per band |
| Calamity EX+1 | 0% (0%) | **85.2%** (81.9%) | 80% |
| Calamity EX+2 | 0% (0%) | **52.8%** (59.3%) | 50% |
| Calamity EX+3 | 0% (0%) | **33.3%** (45.4%) | 30% |

- Levels 1-80: 100% everywhere, unchanged from today.
- Bands still below 95%: Dungeon 101-120 (91.7%), Sunshade 101-140 (92-94%,
  inactive event), War 121-140 (94.3%), Oblivion 141-160 (77.1%) and 161-180
  (54.8%), Training 101-120 (50%; six enemies).
- Fight length rises late: about 20-30 rounds at Lv.101-140, 22-33 in Calamity.

### Why some bands stay below target

Enemies above Lv.100 are already nearly flat (ordinary Lv.110-140 all fight
like Lv.95-103). The remaining misses come from specific cases, not the
overall curve:
1. **Elemental counter-picks:** both Botanic Bruno/Flora trios lose to
   Atmospheric enemies (Vaelor's War forms, the Atmospheric Dungeon). A real
   player would swap teams; the fixed study teams cannot.
2. **Outlier enemies** every trio loses to even when held flat: Dungeon
   Infernic forms 7-8, Oblivion's Fatebreaker Warden and Annihilation Colossus
   Fragment, and Oblivion mid/final.
3. **Training 120:** six Lv.120 enemies against three bearers.
4. **Calamity offense trios** (Crinso/Rosetta/Disciple 30%, Nerithe/Orvella/
   Vaelor 28%) die early; sustain-heavy trios win 70-94%.

Softening the whole curve further to fix these would make all other late
content trivial. Options for the owner are listed under open questions.

### Flare finding

The skill-spending player fires about 0.1 Flares per ordinary fight; the
Flare-saving player about 2 per fight and 6-9 per Calamity fight. Saving wins
more Calamity fights but fewer ordinary ones (more timeouts). Flares are
reachable at the current costs, so **no Flare cost change is proposed**.

### Owner questions

1. Approve candidate D as `radiant-trio-v1`?
2. The bands still below target: accept them as challenge spots, or fix the
   outlier enemies and Training 120 at their source (authored stats or
   formation)? A source fix would be a separate, smaller follow-up.
3. Calamity offense trios: accept that they need a sustain member at EX tiers,
   or address it in Phase 4's Conduit remap?
